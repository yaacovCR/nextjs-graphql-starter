import { createMuiTheme } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import deepOrange from '@material-ui/core/colors/deepOrange';

// A theme with custom primary and secondary color.
const theme = createMuiTheme({
  palette: {
    primary: { main: blueGrey[500] },
    secondary: { main: deepOrange[500] },
  },
});

export default theme;
