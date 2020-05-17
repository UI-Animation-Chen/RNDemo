import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { DraggableGrid } from './drag-grid';

export default class DraggablePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: this.initData(),
            onDragging: false
        };
    }
    
    initData = () => {
        const data = [];
        for (let i = 0; i < 50; i++) {
            data.push({
                key: 'i' + i, // 必须这个字段，且不能重复。
                name: 'item - ' + i
            });
        }
        return data;
    };
    
    renderItem = (item) => {
        return (
            <View
                key={item.name}
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    backgroundColor: '#0f0',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Text style={{ fontSize: 20, color: '#fff' }}>{item.name}</Text>
            </View>
        );
    };
    
    render() {
        return (
            <ScrollView scrollEnabled={!this.state.onDragging}>
                <View style={{ flex: 1 }}>
                    <DraggableGrid
                        style={{ backgroundColor: '#00f' }}
                        numColumns={4}
                        renderItem={this.renderItem}
                        data={this.state.data}
                        onItemPress={() => {
                            console.log('--==-- on item press');
                        }}
                        onDragWillStart={(item) => {
                            this.setState({ onDragging: true });
                            console.log('--==-- on drag will start', item);
                        }}
                        onDragRelease={(data) => {
                            console.log('--==-- on drag release');
                            this.setState({ data, onDragging: false }); // need reset the props data sort after drag release
                        }}
                    />
                </View>
            </ScrollView>
        );
      } 

}
