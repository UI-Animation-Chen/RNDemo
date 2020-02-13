import { connect } from 'react-redux';
import MainComponent from './MainComponent';

const mapStateToProps = (state) => ({
    str: state.str,
    count: state.count
});

export default connect(mapStateToProps)(MainComponent);
