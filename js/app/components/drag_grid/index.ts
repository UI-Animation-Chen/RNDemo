/**
 * 该组件源自github开源组件：https://github.com/SHISME/react-native-draggable-grid
 * 感谢作者。
 * 这里引入源码，修改了组件三个bug，同时为了兼容低版本RN，将react hooks写法转成了class写法。
 * 1、和scrollview冲突，拖拽同时，scrollview也在滑动。 --- 已解决
 * 2、长按之后，不滑动直接松开手指，图标处于放大选中状态，不能恢复原状。 --- 已解决
 * 3、安卓端，在长按临界值时立马拖动，会出现图标被选中放大，但没有跟着拖拽。 --- 改为class后，问题莫名消失了。。。
 */

import DraggableGrid, { IDraggableGridProps } from './draggable-grid';

export { DraggableGrid, IDraggableGridProps };

export default DraggableGrid;
