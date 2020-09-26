import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ToastAndroid } from 'react-native';

export default class RecycleScrollview extends React.PureComponent {

    constructor(props) {
        super(props);
        this.listData = [];
        this.itemW = 100;
        this.itemH = 60;
        this.offsetX = 0;
        this.offsetY = 0;
        this.renderItemCountVertical = 0;
        this.triggerIndexVertical = 0;
        this.swapCountVertical = 0;
        this.renderItemCountHorizontal = 0;
        this.triggerIndexHorizontal = 0;
        this.swapCountHorizontal = 0;
        this.topBlank = 0;
        this.bottomBlank = 0;
        this.leftBlank = 0;
        this.rightBlank = 0;
        this.renderViews = [];

        this.state = {
            topBlank: this.topBlank, bottomBlank: this.bottomBlank,
            leftBlank: this.leftBlank, rightBlank: this.rightBlank,
            containerW: 0, containerH: 0
        };

        this.prepareData(50);
    }

    prepareData = (listDataLen) => {
        this.listData = [];
        for (let row = 0; row < listDataLen; row++) {
            const rowData = [];
            for (let column = 0; column < listDataLen; column++) {
                rowData.push(row + ', ' + column);
            }
            this.listData.push(rowData);
        }
        // setTimeout(() => {
        //     for (let i = listDataLen; i < listDataLen + 30; i++) {
        //         this.listData.push('data-' + i);
        //     }
        //     const { containerW, containerH } = this.state;
        //     this.updateConfig(containerW, containerH);
        // }, 3000);
    };

    updateConfig = (containerW_, containerH_) => {
        this.renderItemCountVertical = Math.ceil(containerH_ / this.itemH) * 3;
        this.triggerIndexVertical = Math.floor(this.renderItemCountVertical / 2);
        this.swapCountVertical = Math.floor(this.renderItemCountVertical / 3);
        this.bottomBlank = (this.listData.length - this.renderItemCountVertical) * this.itemH - this.topBlank;
        this.bottomBlank = this.bottomBlank < 0 ? 0 : this.bottomBlank;

        this.renderItemCountHorizontal = Math.ceil(containerW_ / this.itemW) * 3;
        this.triggerIndexHorizontal = Math.floor(this.renderItemCountHorizontal / 2);
        this.swapCountHorizontal = Math.floor(this.renderItemCountHorizontal / 3);
        this.rightBlank = (this.listData[0].length - this.renderItemCountHorizontal) * this.itemW - this.leftBlank;
        this.rightBlank = this.rightBlank < 0 ? 0 : this.rightBlank;

        this.increaseRenderViewsIfNeed();

        const { leftBlank, bottomBlank, containerW, containerH } = this.state;
        if (leftBlank !== this.leftBlank || bottomBlank !== this.bottomBlank ||
                containerW !== containerW_ || containerH !== containerH_) {
            this.setState({
                rightBlank: this.rightBlank, bottomBlank: this.bottomBlank,
                containerW: containerW_, containerH: containerH_
            });
        } else {
            this.forceUpdate();
        }
    };

    increaseRenderViewsIfNeed = () => {
        if (this.renderViews.length >= this.renderItemCountVertical &&
            this.renderViews[0].length >= this.renderItemCountHorizontal) {
            return;
        }
        let realRenderItemCountVertical = this.renderItemCountVertical;
        if (this.renderItemCountVertical > this.listData.length) {
            realRenderItemCountVertical = this.listData.length;
        }
        let realRenderItemCountHorizontal = this.renderItemCountHorizontal;
        if (this.renderItemCountHorizontal > this.listData[0].length) {
            realRenderItemCountHorizontal = this.listData[0].length;
        }
        this.renderViews = [];
        for (let i = 0; i < realRenderItemCountVertical; i++) {
            this.renderViews.push(this.renderRows(i, 0, realRenderItemCountHorizontal));
        }
    };

    getListStartIndexVercital = () => {
        const firstVisibleIndex = Math.floor(this.offsetY / this.itemH);
        const firstVisibleIndexInRender = Math.floor((this.offsetY - this.topBlank) / this.itemH);
        return firstVisibleIndex - firstVisibleIndexInRender;
    };

    getListStartIndexHorizontal = () => {
        const firstVisibleIndex = Math.floor(this.offsetX / this.itemW);
        const firstVisibleIndexInRender = Math.floor((this.offsetX - this.leftBlank) / this.itemW);
        return firstVisibleIndex - firstVisibleIndexInRender;
    };

    onScrollHorizontal = ({ nativeEvent }) => {
        this.scrollViewsHorizontal(Math.abs(nativeEvent.contentOffset.x));
    };

    onScrollVertical = ({ nativeEvent }) => {
        this.scrollViewsVertical(Math.abs(nativeEvent.contentOffset.y));
    };

    // 内部没使用state变量
    scrollViewsHorizontal = offsetX => {
        let isScrollLeft = this.offsetX < offsetX;
        this.offsetX = offsetX;
        const firstVisibleIndex = Math.floor(this.offsetX / this.itemW);
        const firstVisibleIndexInRender = Math.floor((this.offsetX - this.leftBlank) / this.itemW);
        const rowStart = this.getListStartIndexVercital();
        if (isScrollLeft) { // scroll left
            if (firstVisibleIndexInRender >= this.triggerIndexHorizontal) {
                let realSwapCount = this.swapCountHorizontal;
                const wantSwapCount = firstVisibleIndexInRender -
                                      (this.triggerIndexHorizontal - this.swapCountHorizontal);
                if (wantSwapCount * this.itemW <= this.rightBlank) { // enough space
                    realSwapCount = wantSwapCount;
                } else {
                    realSwapCount = this.rightBlank / this.itemW;
                }

                if (realSwapCount < this.renderItemCountHorizontal) {
                    for (let row = 0; row < this.renderViews.length; row++) {
                        const tempRenderViews = this.renderViews[row].slice(realSwapCount);
                        for (let i = 0; i < realSwapCount; i++) {
                            const listIndex = firstVisibleIndex +
                                (this.renderItemCountHorizontal - firstVisibleIndexInRender) + i;
                            tempRenderViews.push(this.renderItem(rowStart + row, listIndex));
                        }
                        this.renderViews[row] = tempRenderViews;
                    }
                } else {
                    for (let row = 0; row < this.renderViews.length; row++) {
                        this.renderViews[row] = [];
                        const listIndexBase = firstVisibleIndex - (firstVisibleIndexInRender - realSwapCount);
                        for (let i = 0; i < this.renderItemCountHorizontal; i++) {
                            this.renderViews[row].push(this.renderItem(rowStart + row, listIndexBase + i));
                        }
                    }
                }

                this.leftBlank += this.itemW * realSwapCount;
                this.rightBlank -= this.itemW * realSwapCount;
                this.setState({ leftBlank: this.leftBlank, rightBlank: this.rightBlank });
            }
        } else {
            if (firstVisibleIndexInRender <= this.triggerIndexHorizontal - this.swapCountHorizontal) {
                let realSwapCount = this.swapCountHorizontal;
                if (this.leftBlank < this.swapCountHorizontal * this.itemW) {
                    realSwapCount = this.leftBlank / this.itemW;
                    if (realSwapCount <= 0) {
                        return;
                    }
                }
                for (let row = 0; row < this.renderViews.length; row++) {
                    const tempRenderViews = [];
                    for (let i = realSwapCount; i > 0; i--) {
                        const listIndex = firstVisibleIndex - firstVisibleIndexInRender - i;
                        tempRenderViews.push(this.renderItem(rowStart + row, listIndex));
                    }
                    this.renderViews[row] = tempRenderViews.concat(
                        this.renderViews[row].slice(0, this.renderItemCountHorizontal - realSwapCount));
                }
                this.leftBlank -= this.itemW * realSwapCount;
                this.rightBlank += this.itemW * realSwapCount;
                this.setState({ leftBlank: this.leftBlank, rightBlank: this.rightBlank });
            }
        }
    };

    // 内部没使用state变量
    scrollViewsVertical = offsetY => {
        let isScrollUp = this.offsetY < offsetY;
        this.offsetY = offsetY;
        if ((isScrollUp && this.bottomBlank <= 0) || (!isScrollUp && this.topBlank <= 0)) {
            return;
        }
        const firstVisibleIndex = Math.floor(this.offsetY / this.itemH);
        const firstVisibleIndexInRender = Math.floor((this.offsetY - this.topBlank) / this.itemH);
        const columnStart = this.getListStartIndexHorizontal();
        const columnEnd = columnStart + this.renderViews[0].length;
        if (isScrollUp) { // scroll up
            if (firstVisibleIndexInRender >= this.triggerIndexVertical) {
                let realSwapCount = this.swapCountVertical;
                const wantSwapCount = firstVisibleIndexInRender -
                                      (this.triggerIndexVertical - this.swapCountVertical);
                if (wantSwapCount * this.itemH <= this.bottomBlank) { // enough space
                    realSwapCount = wantSwapCount;
                } else {
                    realSwapCount = this.bottomBlank / this.itemH;
                }

                if (realSwapCount < this.renderItemCountVertical) {
                    const tempRenderViews = this.renderViews.slice(realSwapCount);
                    const listIndexBase = firstVisibleIndex +
                                          (this.renderItemCountVertical - firstVisibleIndexInRender);
                    for (let i = 0; i < realSwapCount; i++) {
                        tempRenderViews.push(this.renderRows(listIndexBase + i, columnStart, columnEnd));
                    }
                    this.renderViews = tempRenderViews;
                } else {
                    this.renderViews = [];
                    const listIndexBase = firstVisibleIndex - (firstVisibleIndexInRender - realSwapCount);
                    for (let i = 0; i < this.renderItemCountVertical; i++) {
                        this.renderViews.push(this.renderRows(listIndexBase + i, columnStart, columnEnd));
                    }
                }
                
                this.topBlank += this.itemH * realSwapCount;
                this.bottomBlank -= this.itemH * realSwapCount;
                this.setState({ topBlank: this.topBlank, bottomBlank: this.bottomBlank });
            }
        } else {
            if (firstVisibleIndexInRender <= this.triggerIndexVertical - this.swapCountVertical) {
                let realSwapCount = this.swapCountVertical;
                if (this.topBlank < this.swapCountVertical * this.itemH) {
                    realSwapCount = this.topBlank / this.itemH;
                    if (realSwapCount <= 0) {
                        return;
                    }
                }
                const tempRenderViews = [];
                for (let i = realSwapCount; i > 0; i--) {
                    const listIndex = firstVisibleIndex - firstVisibleIndexInRender - i;
                    tempRenderViews.push(this.renderRows(listIndex, columnStart, columnEnd));
                }
                this.renderViews = tempRenderViews.concat(
                    this.renderViews.slice(0, this.renderItemCountVertical - realSwapCount));
                this.topBlank -= this.itemH * realSwapCount;
                this.bottomBlank += this.itemH * realSwapCount;
                this.setState({ topBlank: this.topBlank, bottomBlank: this.bottomBlank });
            }
        }
    };

    renderRows = (rowIndex, startColumn, endColumn) => {
        const row = [];
        for (let i = startColumn; i < endColumn; i++) {
            row.push(this.renderItem(rowIndex, i));
        }
        return row;
    };

    renderItem = (row, column) => {
        return (
            <TouchableOpacity key={this.listData[row][column]} onPress={() => {
                ToastAndroid.show(row + ', ' + column, ToastAndroid.SHORT);
                this.updateItemState(row, column);
            }}>
                <Text
                    style={{
                        width: this.itemW, height: this.itemH, padding: 10,
                        borderBottomWidth: 1, borderBottomColor: '#333',
                        borderRightWidth: 1, borderRightColor: '#333',
                        textAlignVertical: 'center', textAlign: 'center'
                    }}
                >
                    {this.listData[row][column]}
                </Text>
            </TouchableOpacity>
        );
    };

    render2dataIndex = (renderRow, renderColumn) => {
        const dataRow = renderRow + this.topBlank / this.itemH;
        const dataColumn = renderColumn + this.leftBlank / this.itemW;
        return ({dataRow, dataColumn});
    };

    data2renderIndex = (dataRow, dataColumn) => {
        const renderRow = dataRow - this.topBlank / this.itemH;
        const renderColumn = dataColumn - this.leftBlank / this.itemW;
        return ({renderRow, renderColumn});
    };

    updateItemState = (row, column) => {
        this.listData[row][column] = 'hahaha';
        const { renderRow, renderColumn } = this.data2renderIndex(row, column);
        this.renderViews[renderRow][renderColumn] = this.renderItem(row, column)
        this.forceUpdate();
    };

    _keyExtractor = (item, index) => {
        return item;
    };

    render() {
        const rows= [];
        for (let i = 0; i < this.renderViews.length; i++) {
            rows.push(
                <View key={'' + i} style={{ flexDirection: 'row' }}>
                    {this.renderViews[i]}
                </View>
            );
        }
        const { leftBlank, rightBlank, topBlank, bottomBlank } = this.state;
        return (
            <View style={{ flex: 1 }} onLayout={({ nativeEvent }) => {
                this.updateConfig(nativeEvent.layout.width, nativeEvent.layout.height);
            }}>
                {
                    (this.renderViews && this.renderViews.length > 0) ?
                    <ScrollView horizontal={true} onScroll={this.onScrollHorizontal}>
                        <ScrollView onScroll={this.onScrollVertical}>
                            <View
                                style={{
                                    paddingLeft: leftBlank, paddingRight: rightBlank,
                                    paddingTop: topBlank, paddingBottom: bottomBlank
                                }}
                            >
                                {rows}
                            </View>
                        </ScrollView>
                    </ScrollView>
                    : null
                }
            </View>
        );
    }

}
