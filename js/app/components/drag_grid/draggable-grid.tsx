import React from 'react';
import { PanResponder, Animated } from 'react-native';
import Block from './block';
import { findKey, findIndex, differenceBy } from './utils';

export interface IOnLayoutEvent {
    nativeEvent: {
        layout: { x: number; y: number; width: number; height: number };
    };
}

interface IBaseItemType {
    key: string;
    disabledDrag?: boolean;
    disabledReSorted?: boolean;
}

export interface IDraggableGridProps<DataType extends IBaseItemType> {
    numColumns: number;
    data: DataType[];
    renderItem: (item: DataType, order: number) => any;
    style?: any;
    itemHeight?: number;
    dragStartAnimation?: any;
    onItemPress?: (item: DataType) => void;
    onDragWillStart?: (item: DataType) => void;
    onDragStart?: (item: DataType) => void;
    onDragRelease?: (newSortedData: DataType[]) => void;
    onResetSort?: (newSortedData: DataType[]) => void;
}

interface IPositionOffset {
    x: number;
    y: number;
}

interface IOrderMapItem {
    order: number;
}

interface IItem<DataType> {
    key: string;
    itemData: DataType;
    currentPosition: Animated.AnimatedValueXY;
}

interface State {
    blockWidth: number;
    blockHeight: number;
    gridHeight: any;
    hadInitBlockSize: boolean;
    dragStartAnimatedValue: Animated.Value;
    gridLayout: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    activeItemIndex: undefined | number;
    panResponderCapture: boolean;
}

export default class DraggableGrid extends React.Component<
    IDraggableGridProps<IBaseItemType>,
    State
> {
    dragStarted: boolean;
    activeBlockOffset: { x: number; y: number };
    blockPositions: IPositionOffset[];
    orderMap: {
        [itemKey: string]: IOrderMapItem;
    };
    items: IItem<any>[];
    itemMap: {
        [itemKey: string]: any;
    };

    constructor(props) {
        super(props);

        this.dragStarted = false;
        this.activeBlockOffset = { x: 0, y: 0 };
        this.blockPositions = [];
        this.orderMap = {};
        this.itemMap = {};
        this.items = [];

        this.state = {
            blockHeight: 0,
            blockWidth: 0,
            gridHeight: new Animated.Value(0),
            hadInitBlockSize: false,
            dragStartAnimatedValue: new Animated.Value(1),
            gridLayout: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            activeItemIndex: undefined,
            panResponderCapture: false
        };
    }

    assessGridSize = (event: IOnLayoutEvent) => {
        const { hadInitBlockSize } = this.state;
        const { itemHeight, numColumns } = this.props;
        if (!hadInitBlockSize) {
            const blockWidth = event.nativeEvent.layout.width / numColumns;
            const blockHeight = itemHeight || blockWidth;
            this.setState({
                blockWidth: blockWidth,
                blockHeight: blockHeight,
                gridLayout: event.nativeEvent.layout,
                hadInitBlockSize: true
            });
        }
    };

    initBlockPositions = () => {
        this.items.forEach((item, index) => {
            this.blockPositions[index] = this.getBlockPositionByOrder(index);
        });
    };

    getBlockPositionByOrder = (order: number) => {
        if (this.blockPositions[order]) {
            return this.blockPositions[order];
        }
        const { blockWidth, blockHeight } = this.state;
        const { numColumns } = this.props;
        const columnOnRow = order % numColumns;
        const x = columnOnRow * blockWidth;
        const y = blockHeight * Math.floor(order / numColumns);
        return { x, y };
    };

    resetGridHeight = () => {
        const { blockHeight, gridHeight } = this.state;
        const { numColumns, data } = this.props;
        const rowCount = Math.ceil(data.length / numColumns);
        gridHeight.setValue(rowCount * blockHeight);
    };

    onBlockPress = (itemIndex: number) => {
        const { onItemPress } = this.props;
        onItemPress && onItemPress(this.items[itemIndex].itemData);
    };

    onStartDrag = (nativeEvent: any, gestureState: any) => {
        const activeItem = this.getActiveItem();
        if (!activeItem) return false;

        const { onDragStart } = this.props;

        this.dragStarted = true;
        onDragStart && onDragStart(activeItem.itemData);

        const { x0, y0, moveX, moveY } = gestureState;
        const activeOrigin = this.blockPositions[
            this.orderMap[activeItem.key].order
        ];
        const x = activeOrigin.x - x0;
        const y = activeOrigin.y - y0;
        activeItem.currentPosition.setOffset({ x, y });
        this.activeBlockOffset = { x, y };
        activeItem.currentPosition.setValue({ x: moveX, y: moveY });
    };

    onHandMove = (nativeEvent: any, gestureState: any) => {
        const activeItem = this.getActiveItem();
        if (!activeItem) return false;

        const { moveX, moveY } = gestureState;
        const { blockWidth, gridLayout, activeItemIndex } = this.state;

        const xChokeAmount = Math.max(
            0,
            this.activeBlockOffset.x + moveX - (gridLayout.width - blockWidth)
        );
        const xMinChokeAmount = Math.min(0, this.activeBlockOffset.x + moveX);

        const dragPosition = {
            x: moveX - xChokeAmount - xMinChokeAmount,
            y: moveY
        };
        const originPosition = this.blockPositions[
            this.orderMap[activeItem.key].order
        ];
        const dragPositionToActivePositionDistance = this.getDistance(
            dragPosition,
            originPosition
        );
        activeItem.currentPosition.setValue(dragPosition);

        let closestItemIndex = activeItemIndex as number;
        let closestDistance = dragPositionToActivePositionDistance;

        // find out the closest item
        this.items.forEach((item, index) => {
            if (item.itemData.disabledReSorted) return;
            if (index !== activeItemIndex) {
                const dragPositionToItemPositionDistance = this.getDistance(
                    dragPosition,
                    this.blockPositions[this.orderMap[item.key].order]
                );
                if (
                    dragPositionToItemPositionDistance < closestDistance &&
                    dragPositionToItemPositionDistance < blockWidth
                ) {
                    closestItemIndex = index;
                    closestDistance = dragPositionToItemPositionDistance;
                }
            }
        });
        if (activeItemIndex !== closestItemIndex) {
            const closetOrder =
                this.orderMap[this.items[closestItemIndex].key].order;
            this.resetBlockPositionByOrder(
                this.orderMap[activeItem.key].order,
                closetOrder
            );
            this.orderMap[activeItem.key].order = closetOrder;
            const { onResetSort } = this.props;
            onResetSort && onResetSort(this.getSortData());
        }
    };

    onHandRelease = () => {
        const activeItem = this.getActiveItem();
        if (!activeItem) return false;

        const { onDragRelease } = this.props;
        onDragRelease && onDragRelease(this.getSortData());
        activeItem.currentPosition.flattenOffset();
        this.moveBlockToBlockOrderPosition(activeItem.key);
        this.setState({
            panResponderCapture: false,
            activeItemIndex: undefined
        });
    };

    resetBlockPositionByOrder = (
        activeItemOrder: number,
        insertedPositionOrder: number
    ) => {
        let disabledReSortedItemCount = 0;
        if (activeItemOrder > insertedPositionOrder) {
            for (let i = activeItemOrder - 1; i >= insertedPositionOrder; i--) {
                const key = this.getKeyByOrder(i);
                const item = this.itemMap[key];
                if (item && item.disabledReSorted) {
                    disabledReSortedItemCount++;
                } else {
                    this.orderMap[key].order += disabledReSortedItemCount + 1;
                    disabledReSortedItemCount = 0;
                    this.moveBlockToBlockOrderPosition(key);
                }
            }
        } else {
            for (let i = activeItemOrder + 1; i <= insertedPositionOrder; i++) {
                const key = this.getKeyByOrder(i);
                const item = this.itemMap[key];
                if (item && item.disabledReSorted) {
                    disabledReSortedItemCount++;
                } else {
                    this.orderMap[key].order -= disabledReSortedItemCount + 1;
                    disabledReSortedItemCount = 0;
                    this.moveBlockToBlockOrderPosition(key);
                }
            }
        }
    };

    moveBlockToBlockOrderPosition = (itemKey: string) => {
        const itemIndex = findIndex(this.items, item => item.key === itemKey);
        this.items[itemIndex].currentPosition.flattenOffset();
        Animated.timing(this.items[itemIndex].currentPosition, {
            toValue: this.blockPositions[this.orderMap[itemKey].order],
            duration: 200,
            useNativeDriver: false
        }).start();
    };

    getKeyByOrder = (order: number) => {
        return findKey(
            this.orderMap,
            (item: IOrderMapItem) => item.order === order
        ) as string;
    };

    getSortData = () => {
        const sortData = [];
        this.items.forEach(item => {
            sortData[this.orderMap[item.key].order] = item.itemData;
        });
        return sortData;
    };

    getDistance = (
        startOffset: IPositionOffset,
        endOffset: IPositionOffset
    ) => {
        const xDistance =
            startOffset.x + this.activeBlockOffset.x - endOffset.x;
        const yDistance =
            startOffset.y + this.activeBlockOffset.y - endOffset.y;
        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    };

    setActiveBlock = (itemIndex: number, item) => {
        if (item.disabledDrag) return;

        this.dragStarted = false;
        const { onDragWillStart } = this.props;
        onDragWillStart && onDragWillStart(item);
        this.setState({
            panResponderCapture: true,
            activeItemIndex: itemIndex
        });
    };

    startDragStartAnimation = () => {
        if (!this.props.dragStartAnimation) {
            this.state.dragStartAnimatedValue.setValue(1);
            Animated.timing(this.state.dragStartAnimatedValue, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: false
            }).start();
        }
    };

    getBlockStyle = (itemIndex: number) => {
        const { hadInitBlockSize, blockWidth, blockHeight } = this.state;
        return [
            {
                justifyContent: 'center',
                alignItems: 'center'
            },
            hadInitBlockSize && {
                width: blockWidth,
                height: blockHeight,
                position: 'absolute',
                top: this.items[itemIndex].currentPosition.getLayout().top,
                left: this.items[itemIndex].currentPosition.getLayout().left
            }
        ];
    };

    getDragStartAnimation = (itemIndex: number) => {
        if (this.state.activeItemIndex !== itemIndex) {
            return;
        }

        const dragStartAnimation =
            this.props.dragStartAnimation ||
            this.getDefaultDragStartAnimation();
        return {
            zIndex: 3,
            ...dragStartAnimation
        };
    };

    getActiveItem = () => {
        const { activeItemIndex } = this.state;
        if (activeItemIndex === undefined) return false;
        return this.items[activeItemIndex];
    };

    getDefaultDragStartAnimation = () => {
        return {
            transform: [
                { scale: this.state.dragStartAnimatedValue }
            ],
            shadowColor: '#000000',
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 1, height: 1 }
        };
    };

    addItem = (item, index: number) => {
        this.blockPositions.push(
            this.getBlockPositionByOrder(this.items.length)
        );
        this.orderMap[item.key] = { order: index };
        this.itemMap[item.key] = item;
        this.items.push({
            key: item.key,
            itemData: item,
            currentPosition: new Animated.ValueXY(
                this.getBlockPositionByOrder(index)
            )
        });
    };

    removeItem = (item: IItem<any>) => {
        const itemIndex = findIndex(
            this.items,
            curItem => curItem.key === item.key
        );
        this.items.splice(itemIndex, 1);
        this.blockPositions.pop();
        delete this.orderMap[item.key];
    };

    diffData = () => {
        this.props.data.forEach((item, index) => {
            if (this.orderMap[item.key]) {
                if (this.orderMap[item.key].order !== index) {
                    this.orderMap[item.key].order = index;
                    this.moveBlockToBlockOrderPosition(item.key);
                }
                const currentItem = this.items.find(i => i.key === item.key);
                if (currentItem) {
                    currentItem.itemData = item;
                }
                this.itemMap[item.key] = item;
            } else {
                this.addItem(item, index);
            }
        });
        const deleteItems = differenceBy(this.items, this.props.data, 'key');
        deleteItems.forEach(item => {
            this.removeItem(item);
        });
    };

    componentDidMount() {
        this.startDragStartAnimation();
        if (this.state.hadInitBlockSize) {
            this.initBlockPositions();
        }
        this.resetGridHeight();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.activeItemIndex !== prevState.activeItemIndex) {
            this.startDragStartAnimation();
        }
        if (this.state.hadInitBlockSize) {
            if (this.state.gridLayout !== prevState.gridLayout) {
                this.initBlockPositions();
            }
        }
        this.resetGridHeight();
    }

    render() {
        if (this.state.hadInitBlockSize) {
            this.diffData();
        }
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: () => this.state.panResponderCapture,
            onMoveShouldSetPanResponderCapture: () =>
                this.state.panResponderCapture,
            onShouldBlockNativeResponder: () => false,
            onPanResponderTerminationRequest: () => false,
            onPanResponderGrant: this.onStartDrag,
            onPanResponderMove: this.onHandMove,
            onPanResponderRelease: this.onHandRelease
        });
        const itemList = this.items.map((item, itemIndex) => {
            return (
                <Block
                    onPress={() => {
                        this.onBlockPress(itemIndex);
                    }}
                    onLongPress={() => {
                        this.setActiveBlock(itemIndex, item.itemData);
                    }}
                    onPressOut={() => {
                        // 如果没有开始拖动，由这里回调release。否则由panHandlers回调。
                        if (!this.dragStarted) {
                            this.onHandRelease();
                        }
                    }}
                    panHandlers={panResponder.panHandlers}
                    style={this.getBlockStyle(itemIndex)}
                    dragStartAnimationStyle={this.getDragStartAnimation(
                        itemIndex
                    )}
                    key={item.key}
                >
                    {this.props.renderItem(
                        item.itemData,
                        this.orderMap[item.key].order
                    )}
                </Block>
            );
        });

        return (
            <Animated.View
                style={[
                    this.props.style,
                    {
                        height: this.state.gridHeight
                    }
                ]}
                onLayout={this.assessGridSize}
            >
                {Boolean(this.state.hadInitBlockSize) && itemList}
            </Animated.View>
        );
    }
}
