import React from 'react';
import { View } from 'react-native';

const len = 20;

export default class DraggablePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currIndex: 0
        };
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            if (this.state.currIndex < len - 1) {
                this.setState({currIndex: this.state.currIndex + 1})
            } else {
                this.setState({currIndex: 0})
            }
        }, 300);
    }

    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
        this.timer = null;
    }

    render() {
        const views = [];
        for (let i = 0; i < 20; i++) {
            views.push(
                <View key={'' + i} style={{ width: 50, height: 50, margin: 4,
                    backgroundColor: this.state.currIndex === i ? '#fff' : '#666' }}/>
            );
        }
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {views}
            </View>
        );
    }

}
