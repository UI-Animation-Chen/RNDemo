import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default class RecycleScrollview extends React.PureComponent {

    constructor(props) {
        super(props);
        this.listData = [];
        this.itemH = 60;
        this.offsetY = 0;
        this.renderingItemCount = 0;
        this.triggerIndex = Math.floor(this.renderingItemCount / 2);
        this.swapCount = Math.floor(this.renderingItemCount / 3);
        this.upperBlankH = 0;
        this.belowBlankH = 0;
        this.renderingViews = [];

        this.state = {
            upperBlankH: this.upperBlankH, belowBlankH: this.belowBlankH,
            containerH: 0
        };

        this.prepareData(50);
    }

    prepareData = (listDataLen) => {
        this.listData = [];
        for (let i = 0; i < listDataLen; i++) {
            this.listData.push('data-' + i);
        }
        setTimeout(() => {
            for (let i = listDataLen; i < listDataLen + 30; i++) {
                this.listData.push('data-' + i);
            }
            this.updateConfig(this.state.containerH);
        }, 3000);
    };

    updateConfig = containerH_ => {
        this.renderingItemCount = Math.ceil(containerH_ / this.itemH) * 3;
        this.triggerIndex = Math.floor(this.renderingItemCount / 2);
        this.swapCount = Math.floor(this.renderingItemCount / 3);
        this.belowBlankH = (this.listData.length - this.renderingItemCount) * this.itemH - this.upperBlankH;
        this.belowBlankH = this.belowBlankH < 0 ? 0 : this.belowBlankH;

        this.increaseRenderingViewsIfNeed();

        const { upperBlankH, belowBlankH, containerH } = this.state;
        if (upperBlankH !== this.upperBlankH ||
            belowBlankH !== this.belowBlankH || containerH !== containerH_) {
            this.setState({
                upperBlankH: this.upperBlankH, belowBlankH: this.belowBlankH,
                containerH: containerH_
            });
        } else {
            this.forceUpdate();
        }
    };

    increaseRenderingViewsIfNeed = () => {
        if (this.renderingViews.length >= this.renderingItemCount) {
            return;
        }
        this.renderingViews = [];
        let realRenderItemCount = this.renderingItemCount;
        if (this.renderingItemCount > this.listData.length) {
            realRenderItemCount = this.listData.length;
        }
        for (let i = 0; i < realRenderItemCount; i++) {
            this.renderingViews.push(this.renderItem(i));
        }
    };

    onScroll = ({ nativeEvent }) => {
        this.scrollViews(Math.abs(nativeEvent.contentOffset.y));
    };

    // 不使用state变量
    scrollViews = offsetY => {
        let isScrollUp = this.offsetY < offsetY;
        this.offsetY = offsetY;
        const firstVisibleIndex = Math.floor(this.offsetY / this.itemH);
        const firstVisibleIndexInRendering = Math.floor((this.offsetY - this.upperBlankH) / this.itemH);
        if (isScrollUp) { // scroll up
            if (firstVisibleIndexInRendering >= this.triggerIndex) {
                let realSwapCount = this.swapCount;
                if (this.belowBlankH < this.swapCount * this.itemH) {
                    realSwapCount = this.belowBlankH / this.itemH;
                    if (realSwapCount <= 0) {
                        return;
                    }
                }
                const tempRenderingViews = this.renderingViews.slice(realSwapCount);
                for (let i = 0; i < realSwapCount; i++) {
                    const listIndex = firstVisibleIndex + (this.renderingItemCount - firstVisibleIndexInRendering) + i;
                    tempRenderingViews.push(this.renderItem(listIndex));
                }
                this.renderingViews = tempRenderingViews;
                this.upperBlankH += this.itemH * realSwapCount;
                this.belowBlankH -= this.itemH * realSwapCount;
                this.setState({ upperBlankH: this.upperBlankH, belowBlankH: this.belowBlankH });
            }
        } else {
            if (firstVisibleIndexInRendering <= this.triggerIndex - this.swapCount) {
                let realSwapCount = this.swapCount;
                if (this.upperBlankH < this.swapCount * this.itemH) {
                    realSwapCount = this.upperBlankH / this.itemH;
                    if (realSwapCount <= 0) {
                        return;
                    }
                }
                const tempRenderingViews = [];
                for (let i = realSwapCount; i > 0; i--) {
                    const listIndex = firstVisibleIndex - firstVisibleIndexInRendering - i;
                    tempRenderingViews.push(this.renderItem(listIndex));
                }
                this.renderingViews = tempRenderingViews.concat(
                    this.renderingViews.slice(0, this.renderingItemCount - realSwapCount));
                this.upperBlankH -= this.itemH * realSwapCount;
                this.belowBlankH += this.itemH * realSwapCount;
                this.setState({ upperBlankH: this.upperBlankH, belowBlankH: this.belowBlankH });
            }
        }
    };

    renderUpperBlank = () => {
        const { upperBlankH } = this.state;
        return (<View key={'upper_blank_view'} style={{ width: 1, height: upperBlankH }}/>);
    };

    renderBelowBlank = () => {
        const { belowBlankH } = this.state;
        return (<View key={'below_blank_view'} style={{ width: 1, height: belowBlankH }}/>);
    };

    renderItem = (index) => {
        return (
            <Text key={this.listData[index]} style={{ height: this.itemH, padding: 10, borderBottomWidth: 1,
                borderBottomColor: '#333' }}>{this.listData[index]}</Text>
        );
    };

    _keyExtractor = (item, index) => {
        return item;
    };

    render() {
        return (
            <View style={{ flex: 1 }} onLayout={({ nativeEvent }) => {
                this.updateConfig(nativeEvent.layout.height);
            }}>
                {
                    (this.renderingViews && this.renderingViews.length > 0) ?
                        <ScrollView
                            onScroll={this.onScroll}
                        >
                            {this.renderUpperBlank()}
                            {this.renderingViews}
                            {this.renderBelowBlank()}
                        </ScrollView>
                    : null
                }
            </View>
        );
    }

}
