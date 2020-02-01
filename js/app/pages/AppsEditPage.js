import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, SectionList } from 'react-native';

export default class AppsEditPage extends React.PureComponent {

    itemMargin = 0;

    state = {sectionData: []};

    constructor(props) {
        super(props);
        this.itemMargin = (Dimensions.get('window').width - 50*5) / 10;
        
        this.createData();
        this.state.sectionData = [...this.sectionData];
    }

    topListData = [
        {
            name: '应用名称',
            desc: '唯一不收佣金的支付工具',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg',
            parentTitle: '基础功能'
        },
        {
            name: '应用名称',
            desc: '唯一不收佣金的支付工具',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg',
            parentTitle: '基础功能'
        },
        {
            name: '应用名称',
            desc: '唯一不收佣金的支付工具',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg',
            parentTitle: '基础功能'
        },
        {
            name: '应用名称',
            desc: '唯一不收佣金的支付工具',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg',
            parentTitle: '基础功能'
        },
        {
            name: '应用名称',
            desc: '唯一不收佣金的支付工具',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg',
            parentTitle: '基础功能'
        },
        {
            name: '应用名称',
            desc: '唯一不收佣金的支付工具',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg',
            parentTitle: '基础功能'
        },
        {
            name: '应用名称',
            desc: '唯一不收佣金的支付工具',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg',
            parentTitle: '基础功能'
        },
        {
            name: '应用名称',
            desc: '唯一不收佣金的支付工具',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg',
            parentTitle: '基础功能'
        },
        {
            name: '应用名称',
            desc: '唯一不收佣金的支付工具',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg',
            parentTitle: '基础功能'
        }
    ];

    item = {
        name: '应用名称',
        desc: '唯一不收佣金的支付工具',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg'
    };

    sectionData = [
        {
            title: '基础功能',
            data: []
        },
        {
            title: '数据策略',
            data: []
        },
        {
            title: '营销业务',
            data: []
        }
    ];

    createData = () => {
        for (let i = 0; i < this.sectionData.length; i++) {
            for (let j = 0; j < 100; j++) {
                this.sectionData[i].data.push(Object.assign({}, this.item,
                    {
                        name: this.item.name + i + '-' + j,
                        desc: this.item.desc + i + '-' + j,
                        parentTitle: this.sectionData[i].title
                    }
                ));
            }
        }
    };

    backBtnPressed = () => {

    };

    save = () => {

    };

    removeTopItem = (index: number) => {
        const sectionIndex = this.sectionData.findIndex((item) => item.title === this.topListData[index].parentTitle);
        if (sectionIndex === -1) {
            return;
        }
        this.sectionData[sectionIndex].data = [...this.sectionData[sectionIndex].data];
        this.sectionData[sectionIndex].data.push(this.topListData[index]);
        this.setState({sectionData: [...this.sectionData]});
    };

    sectionListAddItem = () => {

    };

    onItemPressed = (section, index) => {
        const sectionIndex = this.sectionData.findIndex((item) => item.title === section.title);
        if (sectionIndex === -1) {
            return;
        }
        this.sectionData[sectionIndex].data = [...section.data];
        this.sectionData[sectionIndex].data.splice(index, 1);
        this.setState({sectionData: [...this.sectionData]});
    };

    getTopItem = (index: number) => {
        const item = this.topListData[index];
        return (
            <View key={index} style={{width: 50, margin: this.itemMargin, marginBottom: 15, marginTop: 0,
                  alignItems: 'center'}}>
                <View style={{width: 42, height: 42, borderRadius: 6, overflow: 'hidden'}}>
                    <Image style={{width: 42, height: 42}}
                        source={require('../images/selected.png')}/>
                </View>
                <Text style={{fontSize: 12, color: '#595959', marginTop: 6}}>{item.name}</Text>
                <TouchableOpacity style={{position: 'absolute', top: -16, right: -12, padding: 10}}
                                  onPress={() => {this.removeTopItem(index);}}>
                    <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: '#ff5050',
                        justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{color: '#fff', fontSize: 6, fontWeight: 'bold'}}>一</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    renderSectionItem = (info) => {
        const {item, index, section} = info;
        return (
            <View style={{flexDirection: 'row', padding: 14, paddingTop: 0}}>
                <View style={{width: 42, height: 42, borderRadius: 6, overflow: 'hidden'}}>
                    <Image style={{width: 42, height: 42}} source={require('../images/selected.png')}/>
                </View>
                <View style={{marginLeft: 11}}>
                    <Text style={{color: '#202020', fontSize: 14}}>{item.name}</Text>
                    <Text style={{color: '#999', fontSize: 12}}>{item.desc}</Text>
                </View>
                <View style={{flex: 1, height: 1}}/>
                <TouchableOpacity style={{width: 55, height: 27, backgroundColor: '#916cc21a',
                                    alignItems: 'center', justifyContent: 'center', borderRadius: 4}}
                                   onPress={() => {this.onItemPressed(section, index);}}>
                    <Text style={{color: '#7d19ff'}}>添加</Text>
                </TouchableOpacity>
            </View>
        );
    };

    render() {
        const items = [];
        for (let i = 0; i < this.topListData.length; i++) {
            items.push(this.getTopItem(i));
        }
        return (
            <View style={{flex: 1, backgroundColor: '#fff'}}>
                <Text style={{color: '#202020', margin: 16}}>显示在首页的应用</Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 6}}>
                    {items}
                </View>
                <View style={{height: 6, backgroundColor: '#f4f5f8'}}/>
                <SectionList
                    sections={this.state.sectionData}
                    stickySectionHeadersEnabled={true}
                    keyExtractor={(item, index) => ''+index}
                    renderSectionHeader={({section}) => (
                        <View style={{padding: 12, backgroundColor: '#fff'}}>
                            <Text style={{fontSize: 15, color: '#202020', fontWeight: 'bold'}}>
                                {section.title}</Text>
                        </View>
                    )}
                    renderItem={this.renderSectionItem}
                />
            </View>
        );
    }

}

interface AppInfo {
    
}

