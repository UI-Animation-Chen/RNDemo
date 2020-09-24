import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image, FlatList } from 'react-native';
import MyJavaModule from '../../native/modules/MyJavaModule';
  
export default class HomePage extends React.PureComponent {
  
    constructor(props) {
        super(props);
        this.state = {txt: 7};
    }

    play = ()=> {
        // this.setState({txt: -this.state.txt});
        // this.props.navigation.push('redux_page', {
        //     isFromHome: true
        // });
        // this.props.navigation.push('player');
        // this.props.navigation.push('apps_edit_page');
        // this.props.navigation.push('draggable_page');
        // this.props.navigation.push('excel_page');
        this.props.navigation.push('recycle_scrollview_page');
        // MyJavaModule.callJavaMethod();
    };

    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center'}}>
                <TouchableOpacity onPress={this.play}>
                    <Text style={{fontSize: 18}}>play video</Text>
                </TouchableOpacity>
                <Inner txt={this.state.txt}/>
                <View style={{margin: 20, borderRadius: 6, backgroundColor: '#fff', overflow: 'hidden'}}>
                    <Image style={{width: 168, height: 110}}
                        source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'}}/>
                    <Text style={{width: 168, fontSize: 14, color: '#202020', padding: 10}}>北京香江大酒店</Text>
                </View>
                <FlatList
                    data={[1, 2, 3]}
                    renderItem={({item}) => {
                        return <Inner key={'key' + item} txt={item}/>;
                    }}
                />
                <Inner1 />
            </View>
        );
    }
}

let outCounter = 7;

// function component
function Inner(props) {
    const [counter, setCounter] = useState(outCounter--); // useState()中的参数只是第一次起作用。
    function pressed() {
        setCounter(counter + 1);
    };

    return (
        <TouchableOpacity onPress={pressed}>
            <Text style={{marginTop: 10}}>{props.txt} + {counter} + {outCounter}</Text>
        </TouchableOpacity>
    );
}

class Inner1 extends React.Component {
    render() {
        console.log('--==-- inner1');
        return <Text>inner1</Text>
    }
}
