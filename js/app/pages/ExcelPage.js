import React from 'react';
import { View, Text, PanResponder, Animated } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { ToastAndroid } from 'react-native';

const itemW = 80;
const itemH = 50;

export default class ExcelView extends React.PureComponent {

    constructor(props) {
        super(props);
        this.containerW = -1;
        this.containerH = -1;
        this.oldMoveX = 0;
        this.oldMoveY = 0;
        this.transX = 0;
        this.transY = 0;
        this.baseIndexX = 0;
        this.baseIndexY = 0;
        this.state = {
            transX: new Animated.Value(this.transX),
            transY: new Animated.Value(this.transY),
            baseIndexX: 0, baseIndexY: 0
        };
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onShouldBlockNativeResponder: () => false,
            onPanResponderTerminationRequest: () => false,
            onPanResponderGrant: this.onHandStart,
            onPanResponderMove: this.onHandMove,
            onPanResponderRelease: this.onHandRelease
        });

        this.listData = [];
        for (let row = 0; row < 2; row++) {
            const rows = [];
            for (let column = 0; column < 10; column++) {
                rows.push(row + ', ' + column);
            }
            this.listData.push(rows);
        }
        this.refs = [];
    }

    onHandStart = (nativeEvent, gestureState) => {
        const { x0, y0 } = gestureState;
        this.oldMoveX = x0;
        this.oldMoveY = y0;
    };

    onHandMove = (nativeEvent, gestureState) => {
        const { moveX, moveY, vx, vy } = gestureState;
        const deltaX = moveX - this.oldMoveX;
        const deltaY = moveY - this.oldMoveY;
        this.oldMoveX = moveX;
        this.oldMoveY = moveY;
        this.transX += deltaX;
        this.transY += deltaY;
        if (this.transX > 0) {
            this.transX = 0;
        }
        if (this.containerW !== -1) {
            const transXMax =  this.containerW - this.listData[0].length * itemW;
            if (transXMax < 0 && this.transX < transXMax) {
                this.transX = transXMax;
            }
        }
        if (this.transY > 0) {
            this.transY = 0;
        }
        if (this.containerH !== -1) {
            const transYMax =  this.containerH - this.listData.length * itemH;
            if (transYMax <= 0) {
                if (this.transY < transYMax) {
                    this.transY = transYMax;
                }
            } else {
                this.transY = 0;
            }
        }
        const baseIndexX = Math.floor(Math.abs(this.transX) / itemW);
        // if (this.state.baseIndexX !== baseIndexX) {
        //     this.setState({ baseIndexX });
        // }
        const baseIndexY = Math.floor(Math.abs(this.transY) / itemH);
        // if (this.state.baseIndexY !== baseIndexY) {
        //     this.setState({ baseIndexY });
        // }
        if (this.baseIndexY !== baseIndexY || this.baseIndexX !== baseIndexX) {
            this.baseIndexX = baseIndexX;
            this.baseIndexY = baseIndexY;
            for (let row = 0; row < this.refs.length; row++) {
                const rows = this.refs[row];
                for (let column = 0; column < rows.length; column++) {
                    rows[column].setState({text: this.listData[baseIndexY + row][baseIndexX + column]});
                }
            }
        }
        this.state.transX.setValue(this.transX % itemW);
        this.state.transY.setValue(this.transY % itemH);
    };

    onHandRelease = (nativeEvent, gestureState) => {
        // this.forceUpdate();
        // const { vx, vy } = gestureState;
        // console.log('--==-- vx vy', vx, vy);
        // Animated.timing(this.state.transX, {
        //     toValue: this.transX + vx * 1000,
        //     duration: 1000
        // }).start();
        // Animated.timing(this.state.transY, {
        //     toValue: this.transY + vy * 1000,
        //     duration: 1000
        // }).start();
    };

    render() {
        const { baseIndexX, baseIndexY } = this.state;
        const rows = Math.floor(this.containerH / itemH) + 2;
        const columns = Math.floor(this.containerW / itemW) + 2;
        const views = [];
        this.refs = [];
        if (rows > 2 && columns > 2) {
            for (let i = 0; i < rows; i++) {
                const rowViews = [];
                const rowIndex = baseIndexY + i;
                if (rowIndex >= this.listData.length) {
                    break;
                }
                const rowRefs = [];
                for (let j = 0; j < columns; j++) {
                    const columnIndex = baseIndexX + j;
                    if (columnIndex >= this.listData[0].length) {
                        break;
                    }
                    rowViews.push(
                        <ExcelItem ref={ref => {
                            rowRefs.push(ref);
                        }} text={this.listData[rowIndex][columnIndex]}/>
                    );
                }
                views.push(
                    <View style={{ flexDirection: 'row' }}>
                        {rowViews}
                    </View>
                );
                this.refs.push(rowRefs);
            }
        }
        return (
            <View 
                style={{ flex: 1, backgroundColor: '#0000' }}
                {...this.panResponder.panHandlers}
                onLayout={(e) => {
                    if (this.containerH !== e.nativeEvent.layout.height
                           || this.containerW !== e.nativeEvent.layout.width) {
                        this.containerW = e.nativeEvent.layout.width;
                        this.containerH = e.nativeEvent.layout.height;
                        this.forceUpdate();
                    }
                }}
            >
                <Animated.View style={{
                    flex: 1, left: this.state.transX, top: this.state.transY
                }}>
                    {views}
                </Animated.View>
            </View>
        );
    }

}

class ExcelItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: this.props.text
        };
    }

    update = (text) => {
        this.setState({text});
    }

    render() {
        return (
            <TouchableOpacity onPress={() => {
                ToastAndroid.show(this.state.text, ToastAndroid.SHORT);
            }}>
                <Text style={{ 
                    width: itemW, height: itemH, fontSize: 14,
                    borderColor: '#999', borderWidth: 2,
                    textAlign: 'center', textAlignVertical: 'center'
                }}>{this.state.text}</Text>
            </TouchableOpacity>
        );
    }
}
