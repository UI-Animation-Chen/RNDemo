import { connect } from 'react-redux';
import MainComponent from './MainComponent';
import { Creators } from './CommonActions';

const mapStateToProps = (state) => ({
    str: state.str,
    count: state.count
});

const mapDispatchToProps = (dispatch) => ({
    fetchData: (params) => dispatch(Creators.fetch_data(params))
});

export default connect(mapStateToProps, mapDispatchToProps)(MainComponent);
