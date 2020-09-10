import React from 'react';
import { Animated, TouchableWithoutFeedback } from 'react-native';

interface BlockProps {
    style?: any;
    dragStartAnimationStyle: any;
    onPress?: () => void;
    onLongPress: () => void;
    onPressOut: () => void;
    panHandlers: any;
}

export default class Block extends React.Component<BlockProps> {
    render() {
        const {
            style,
            panHandlers,
            onPress,
            onLongPress,
            onPressOut,
            children,
            dragStartAnimationStyle
        } = this.props;
        return (
            <Animated.View
                style={[
                    { alignItems: 'center' },
                    style,
                    dragStartAnimationStyle
                ]}
                {...panHandlers}
            >
                <Animated.View>
                    <TouchableWithoutFeedback
                        onPress={onPress}
                        onLongPress={onLongPress}
                        onPressOut={onPressOut}
                    >
                        {children}
                    </TouchableWithoutFeedback>
                </Animated.View>
            </Animated.View>
        );
    }
}
