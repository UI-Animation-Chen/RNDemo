import React from 'react';
import {
  PanResponder,
  Animated,
  StyleSheet
} from 'react-native';
import Block from './block';
import { findKey, findIndex, differenceBy } from './utils';

export interface IOnLayoutEvent {
  nativeEvent: { layout: { x: number; y: number; width: number; height: number } }
}

interface IBaseItemType {
  key: string
  disabledDrag?: boolean
  disabledReSorted?: boolean
}

export interface IDraggableGridProps<DataType extends IBaseItemType> {
  numColumns: number
  data: DataType[]
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
  currentPosition: any;
}

let dragStarted = false;
let activeBlockOffset = { x: 0, y: 0 }
const blockPositions: IPositionOffset[] = []
const orderMap: {
  [itemKey: string]: IOrderMapItem
} = {}
const itemMap: {
  [itemKey: string]: any
} = {}
const items: IItem<any>[] = []

export default class DraggableGrid extends React.Component {

  constructor(props) {
    super(props);
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
        height: 0,
      },
      activeItemIndex: undefined,
      panResponderCapture: false
    };
  }

  assessGridSize = (event: IOnLayoutEvent) => {
    const { hadInitBlockSize } = this.state;
    const { itemHeight, numColumns } = this.props;
    if (!hadInitBlockSize) {
      const blockWidth = event.nativeEvent.layout.width / numColumns
      const blockHeight = itemHeight || blockWidth
      this.setState({
        blockWidth: blockWidth,
        blockHeight: blockHeight,
        gridLayout: event.nativeEvent.layout,
        hadInitBlockSize: true
      });
    }
  }

  initBlockPositions = () => {
    items.forEach((item, index) => {
      blockPositions[index] = this.getBlockPositionByOrder(index);
    });
  }

  getBlockPositionByOrder = (order: number) => {
    if (blockPositions[order]) {
      return blockPositions[order]
    }
    const { blockWidth, blockHeight } = this.state;
    const { numColumns } = this.props;
    const columnOnRow = order % numColumns
    const y = blockHeight * Math.floor(order / numColumns)
    const x = columnOnRow * blockWidth
    return {
      x,
      y,
    }
  }

  resetGridHeight = () => {
    const { blockHeight, gridHeight } = this.state;
    const { numColumns, data } = this.props;
    const rowCount = Math.ceil(data.length / numColumns)
    gridHeight.setValue(rowCount * blockHeight)
  }

  onBlockPress = (itemIndex: number) => {
    const { onItemPress } = this.props;
    onItemPress && onItemPress(items[itemIndex].itemData)
  }

  onStartDrag = (nativeEvent: any, gestureState: any) => {
    const activeItem = this.getActiveItem()
    if (!activeItem) return false

    const { onDragStart } = this.props;

    dragStarted = true;
    onDragStart && onDragStart(activeItem.itemData)

    const { x0, y0, moveX, moveY } = gestureState
    const activeOrigin = blockPositions[orderMap[activeItem.key].order]
    const x = activeOrigin.x - x0
    const y = activeOrigin.y - y0
    activeItem.currentPosition.setOffset({
      x,
      y,
    })
    activeBlockOffset = {
      x,
      y,
    }
    activeItem.currentPosition.setValue({
      x: moveX,
      y: moveY,
    })
  }

  onHandMove = (nativeEvent: any, gestureState: any) => {
    const activeItem = this.getActiveItem();
    if (!activeItem) return false

    const { moveX, moveY } = gestureState
    const { blockWidth, gridLayout, activeItemIndex } = this.state;

    const xChokeAmount = Math.max(0, activeBlockOffset.x + moveX - (gridLayout.width - blockWidth))
    const xMinChokeAmount = Math.min(0, activeBlockOffset.x + moveX)

    const dragPosition = {
      x: moveX - xChokeAmount - xMinChokeAmount,
      y: moveY,
    }
    const originPosition = blockPositions[orderMap[activeItem.key].order]
    const dragPositionToActivePositionDistance = this.getDistance(dragPosition, originPosition)
    activeItem.currentPosition.setValue(dragPosition)

    let closetItemIndex = activeItemIndex as number
    let closetDistance = dragPositionToActivePositionDistance

    items.forEach((item, index) => {
      if (item.itemData.disabledReSorted) return
      if (index != activeItemIndex) {
        const dragPositionToItemPositionDistance = this.getDistance(
          dragPosition,
          blockPositions[orderMap[item.key].order],
        )
        if (
          dragPositionToItemPositionDistance < closetDistance &&
          dragPositionToItemPositionDistance < blockWidth
        ) {
          closetItemIndex = index
          closetDistance = dragPositionToItemPositionDistance
        }
      }
    })
    if (activeItemIndex != closetItemIndex) {
      const closetOrder = orderMap[items[closetItemIndex].key].order
      this.resetBlockPositionByOrder(orderMap[activeItem.key].order, closetOrder)
      orderMap[activeItem.key].order = closetOrder
      const {onResetSort} = this.props;
      onResetSort && onResetSort(this.getSortData())
    }
  }

  onHandRelease = () => {
    const activeItem = this.getActiveItem()
    if (!activeItem) return false

    const { onDragRelease } = this.props;
    onDragRelease && onDragRelease(this.getSortData())
    activeItem.currentPosition.flattenOffset()
    this.moveBlockToBlockOrderPosition(activeItem.key)
    this.setState({
      panResponderCapture: false,
      activeItemIndex: undefined
    });
  }

  resetBlockPositionByOrder = (activeItemOrder: number, insertedPositionOrder: number) => {
    let disabledReSortedItemCount = 0
    if (activeItemOrder > insertedPositionOrder) {
      for (let i = activeItemOrder - 1; i >= insertedPositionOrder; i--) {
        const key = this.getKeyByOrder(i)
        const item = itemMap[key]
        if (item && item.disabledReSorted) {
          disabledReSortedItemCount++
        } else {
          orderMap[key].order += disabledReSortedItemCount + 1
          disabledReSortedItemCount = 0
          this.moveBlockToBlockOrderPosition(key);
        }
      }
    } else {
      for (let i = activeItemOrder + 1; i <= insertedPositionOrder; i++) {
        const key = this.getKeyByOrder(i)
        const item = itemMap[key]
        if (item && item.disabledReSorted) {
          disabledReSortedItemCount++
        } else {
          orderMap[key].order -= disabledReSortedItemCount + 1
          disabledReSortedItemCount = 0
          this.moveBlockToBlockOrderPosition(key)
        }
      }
    }
  }

  moveBlockToBlockOrderPosition = (itemKey: string) => {
    const itemIndex = findIndex(items, item => item.key === itemKey)
    items[itemIndex].currentPosition.flattenOffset()
    Animated.timing(items[itemIndex].currentPosition, {
      toValue: blockPositions[orderMap[itemKey].order],
      duration: 200,
    }).start()
  }

  getKeyByOrder = (order: number) => {
    return findKey(orderMap, (item: IOrderMapItem) => item.order === order) as string
  }

  getSortData = () => {
    const sortData = [];
    items.forEach(item => {
      sortData[orderMap[item.key].order] = item.itemData
    })
    return sortData
  }
  getDistance = (startOffset: IPositionOffset, endOffset: IPositionOffset) => {
    const xDistance = startOffset.x + activeBlockOffset.x - endOffset.x
    const yDistance = startOffset.y + activeBlockOffset.y - endOffset.y
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
  }

  setActiveBlock = (itemIndex: number, item) => {
    if (item.disabledDrag) return

    dragStarted = false;
    const { onDragWillStart } = this.props;
    onDragWillStart && onDragWillStart(item); // added this line
    this.setState({
      panResponderCapture: true,
      activeItemIndex: itemIndex
    });
  }

  startDragStartAnimation = () => {
    if (!this.props.dragStartAnimation) {
      this.state.dragStartAnimatedValue.setValue(1)
      Animated.timing(this.state.dragStartAnimatedValue, {
        toValue: 1.2,
        duration: 100,
      }).start()
    }
  }

  getBlockStyle = (itemIndex: number) => {
    const { hadInitBlockSize, blockWidth, blockHeight } = this.state;
    return [
      {
        justifyContent: 'center',
        alignItems: 'center',
      },
      hadInitBlockSize && {
        width: blockWidth,
        height: blockHeight,
        position: 'absolute',
        top: items[itemIndex].currentPosition.getLayout().top,
        left: items[itemIndex].currentPosition.getLayout().left,
      },
    ]
  }
  
  getDragStartAnimation = (itemIndex: number) => {
    if (this.state.activeItemIndex != itemIndex) {
      return
    }

    const dragStartAnimation = this.props.dragStartAnimation || this.getDefaultDragStartAnimation()
    return {
      zIndex: 3,
      ...dragStartAnimation,
    }
  }

  getActiveItem = () => {
    const { activeItemIndex } = this.state;
    if (activeItemIndex === undefined) return false;
    return items[activeItemIndex];
  }

  getDefaultDragStartAnimation = () => {
    return {
      transform: [
        {
          scale: this.state.dragStartAnimatedValue,
        },
      ],
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: {
        width: 1,
        height: 1,
      },
    }
  }
  addItem = (item, index: number) => {
    blockPositions.push(this.getBlockPositionByOrder(items.length))
    orderMap[item.key] = {
      order: index,
    }
    itemMap[item.key] = item
    items.push({
      key: item.key,
      itemData: item,
      currentPosition: new Animated.ValueXY(this.getBlockPositionByOrder(index)),
    })
  }

  removeItem = (item: IItem<any>) => {
    const itemIndex = findIndex(items, curItem => curItem.key === item.key)
    items.splice(itemIndex, 1)
    blockPositions.pop()
    delete orderMap[item.key]
  }

  diffData = () => {
    this.props.data.forEach((item, index) => {
      if (orderMap[item.key]) {
        if (orderMap[item.key].order != index) {
          orderMap[item.key].order = index
          this.moveBlockToBlockOrderPosition(item.key)
        }
        const currentItem = items.find(i => i.key === item.key)
        if (currentItem) {
          currentItem.itemData = item
        }
        itemMap[item.key] = item
      } else {
        this.addItem(item, index)
      }
    })
    const deleteItems = differenceBy(items, this.props.data, 'key')
    deleteItems.forEach(item => {
      this.removeItem(item)
    })
  }

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

  // useEffect(() => {
  //   startDragStartAnimation()
  // }, [activeItemIndex])
  // useEffect(() => {
  //   if (hadInitBlockSize) {
  //     initBlockPositions()
  //   }
  // }, [gridLayout])
  // useEffect(() => {
  //   resetGridHeight()
  // })

  render() {
    if (this.state.hadInitBlockSize) {
      this.diffData()
    }
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => this.state.panResponderCapture,
      onMoveShouldSetPanResponderCapture: () => this.state.panResponderCapture,
      onShouldBlockNativeResponder: () => false,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: this.props.onStartDrag,
      onPanResponderMove: this.onHandMove,
      onPanResponderRelease: this.onHandRelease,
    });
    const itemList = items.map((item, itemIndex) => {
      return (
        <Block
          onPress={() => {this.onBlockPress(itemIndex)}}
          onLongPress={() => {this.setActiveBlock(itemIndex, item.itemData)}}
          onPressOut={() => {
            if (!dragStarted) {
              this.onHandRelease();
            }
          }}
          panHandlers={panResponder.panHandlers}
          style={this.getBlockStyle(itemIndex)}
          dragStartAnimationStyle={this.getDragStartAnimation(itemIndex)}
          key={item.key}
        >
          {this.props.renderItem(item.itemData, orderMap[item.key].order)}
        </Block>
      )
    })

    return (
      <Animated.View
        style={[
          styles.draggableGrid,
          this.props.style,
          {
            height: this.state.gridHeight
          }
        ]}
        onLayout={this.assessGridSize}>
        {Boolean(this.state.hadInitBlockSize) && itemList}
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  draggableGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
})
