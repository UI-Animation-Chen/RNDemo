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
        this.renderingItemCountVertical = 0;
        this.triggerIndexVertical = 0;
        this.swapCountVertical = 0;
        this.renderingItemCountHorizontal = 0;
        this.triggerIndexHorizontal = 0;
        this.swapCountHorizontal = 0;
        this.topBlank = 0;
        this.bottomBlank = 0;
        this.leftBlank = 0;
        this.rightBlank = 0;
        this.renderingViews = [];

        this.state = {
            topBlank: this.topBlank, bottomBlank: this.bottomBlank,
            leftBlank: this.leftBlank, rightBlank: this.rightBlank,
            containerW: 0, containerH: 0
        };

        this.prepareData(100);
    }

    prepareData = (listDataLen) => {
        this.listData = [];
        for (let row = 0; row < listDataLen; row++) {
            const rowData = [];
            for (let column = 0; column < listDataLen - 98; column++) {
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
        this.renderingItemCountVertical = Math.ceil(containerH_ / this.itemH) * 3;
        this.triggerIndexVertical = Math.floor(this.renderingItemCountVertical / 2);
        this.swapCountVertical = Math.floor(this.renderingItemCountVertical / 3);
        this.bottomBlank = (this.listData.length - this.renderingItemCountVertical) * this.itemH - this.topBlank;
        this.bottomBlank = this.bottomBlank < 0 ? 0 : this.bottomBlank;

        this.renderingItemCountHorizontal = Math.ceil(containerW_ / this.itemW) * 3;
        this.triggerIndexHorizontal = Math.floor(this.renderingItemCountHorizontal / 2);
        this.swapCountHorizontal = Math.floor(this.renderingItemCountHorizontal / 3);
        this.rightBlank = (this.listData[0].length - this.renderingItemCountHorizontal) * this.itemW - this.leftBlank;
        this.rightBlank = this.rightBlank < 0 ? 0 : this.rightBlank;

        this.increaseRenderingViewsIfNeed();

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

    increaseRenderingViewsIfNeed = () => {
        if (this.renderingViews.length >= this.renderingItemCountVertical &&
            this.renderingViews[0].length >= this.renderingItemCountHorizontal) {
            return;
        }
        let realRenderItemCountVertical = this.renderingItemCountVertical;
        if (this.renderingItemCountVertical > this.listData.length) {
            realRenderItemCountVertical = this.listData.length;
        }
        let realRenderItemCountHorizontal = this.renderingItemCountHorizontal;
        if (this.renderingItemCountHorizontal > this.listData[0].length) {
            realRenderItemCountHorizontal = this.listData[0].length;
        }
        this.renderingViews = [];
        for (let i = 0; i < realRenderItemCountVertical; i++) {
            this.renderingViews.push(this.renderRows(i, 0, realRenderItemCountHorizontal));
        }
    };

    getListStartIndexVercital = () => {
        const firstVisibleIndex = Math.floor(this.offsetY / this.itemH);
        const firstVisibleIndexInRendering = Math.floor((this.offsetY - this.topBlank) / this.itemH);
        return firstVisibleIndex - firstVisibleIndexInRendering;
    };

    getListStartIndexHorizontal = () => {
        const firstVisibleIndex = Math.floor(this.offsetX / this.itemW);
        const firstVisibleIndexInRendering = Math.floor((this.offsetX - this.leftBlank) / this.itemW);
        return firstVisibleIndex - firstVisibleIndexInRendering;
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
        const firstVisibleIndexInRendering = Math.floor((this.offsetX - this.leftBlank) / this.itemW);
        const rowStart = this.getListStartIndexVercital();
        if (isScrollLeft) { // scroll left
            if (firstVisibleIndexInRendering >= this.triggerIndexHorizontal) {
                const timeStart = Date.now();
                let realSwapCount = this.swapCountHorizontal;
                if (this.rightBlank < this.swapCountHorizontal * this.itemW) {
                    realSwapCount = this.rightBlank / this.itemW;
                    if (realSwapCount <= 0) {
                        return;
                    }
                }
                for (let row = 0; row < this.renderingViews.length; row++) {
                    const tempRenderingViews = this.renderingViews[row].slice(realSwapCount);
                    for (let i = 0; i < realSwapCount; i++) {
                        const listIndex = firstVisibleIndex +
                            (this.renderingItemCountHorizontal - firstVisibleIndexInRendering) + i;
                        tempRenderingViews.push(this.renderItem(rowStart + row, listIndex));
                    }
                    this.renderingViews[row] = tempRenderingViews;
                }
                this.leftBlank += this.itemW * realSwapCount;
                this.rightBlank -= this.itemW * realSwapCount;
                this.setState({ leftBlank: this.leftBlank, rightBlank: this.rightBlank });
                console.log('--==-- horizontal', Date.now() - timeStart);
            }
        } else {
            if (firstVisibleIndexInRendering <= this.triggerIndexHorizontal - this.swapCountHorizontal) {
                const timeStart = Date.now();
                let realSwapCount = this.swapCountHorizontal;
                if (this.leftBlank < this.swapCountHorizontal * this.itemW) {
                    realSwapCount = this.leftBlank / this.itemW;
                    if (realSwapCount <= 0) {
                        return;
                    }
                }
                for (let row = 0; row < this.renderingViews.length; row++) {
                    const tempRenderingViews = [];
                    for (let i = realSwapCount; i > 0; i--) {
                        const listIndex = firstVisibleIndex - firstVisibleIndexInRendering - i;
                        tempRenderingViews.push(this.renderItem(rowStart + row, listIndex));
                    }
                    this.renderingViews[row] = tempRenderingViews.concat(
                        this.renderingViews[row].slice(0, this.renderingItemCountHorizontal - realSwapCount));
                }
                this.leftBlank -= this.itemW * realSwapCount;
                this.rightBlank += this.itemW * realSwapCount;
                this.setState({ leftBlank: this.leftBlank, rightBlank: this.rightBlank });
                console.log('--==-- horizontal', Date.now() - timeStart);
            }
        }
    };

    // 内部没使用state变量
    scrollViewsVertical = offsetY => {
        let isScrollUp = this.offsetY < offsetY;
        this.offsetY = offsetY;
        const firstVisibleIndex = Math.floor(this.offsetY / this.itemH);
        const firstVisibleIndexInRendering = Math.floor((this.offsetY - this.topBlank) / this.itemH);
        const columnStart = this.getListStartIndexHorizontal();
        const columnEnd = columnStart + this.renderingViews[0].length;
        if (isScrollUp) { // scroll up
            if (firstVisibleIndexInRendering >= this.triggerIndexVertical) {
                let realSwapCount = this.swapCountVertical;
                if (this.bottomBlank < this.swapCountVertical * this.itemH) {
                    realSwapCount = this.bottomBlank / this.itemH;
                    if (realSwapCount <= 0) {
                        return;
                    }
                }
                const tempRenderingViews = this.renderingViews.slice(realSwapCount);
                for (let i = 0; i < realSwapCount; i++) {
                    const listIndex = firstVisibleIndex +
                        (this.renderingItemCountVertical - firstVisibleIndexInRendering) + i;
                    tempRenderingViews.push(this.renderRows(listIndex, columnStart, columnEnd));
                }
                this.renderingViews = tempRenderingViews;
                
                this.topBlank += this.itemH * realSwapCount;
                this.bottomBlank -= this.itemH * realSwapCount;
                this.setState({ topBlank: this.topBlank, bottomBlank: this.bottomBlank });
            }
        } else {
            if (firstVisibleIndexInRendering <= this.triggerIndexVertical - this.swapCountVertical) {
                let realSwapCount = this.swapCountVertical;
                if (this.topBlank < this.swapCountVertical * this.itemH) {
                    realSwapCount = this.topBlank / this.itemH;
                    if (realSwapCount <= 0) {
                        return;
                    }
                }
                const tempRenderingViews = [];
                for (let i = realSwapCount; i > 0; i--) {
                    const listIndex = firstVisibleIndex - firstVisibleIndexInRendering - i;
                    tempRenderingViews.push(this.renderRows(listIndex, columnStart, columnEnd));
                }
                this.renderingViews = tempRenderingViews.concat(
                    this.renderingViews.slice(0, this.renderingItemCountVertical - realSwapCount));
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

    _keyExtractor = (item, index) => {
        return item;
    };

    render() {
        const rows= [];
        for (let i = 0; i < this.renderingViews.length; i++) {
            rows.push(
                <View key={'' + i} style={{ flexDirection: 'row' }}>
                    {this.renderingViews[i]}
                </View>
            );
        }
        const { leftBlank, rightBlank, topBlank, bottomBlank } = this.state;
        return (
            <View style={{ flex: 1 }} onLayout={({ nativeEvent }) => {
                this.updateConfig(nativeEvent.layout.width, nativeEvent.layout.height);
            }}>
                {
                    (this.renderingViews && this.renderingViews.length > 0) ?
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
