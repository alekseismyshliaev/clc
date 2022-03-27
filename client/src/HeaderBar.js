import React from "react";
import { AppBar, Avatar, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { GoogleLogin, GoogleLogout } from "react-google-login";


const CLIENT_ID = `${process.env.REACT_APP_GOOGLE_CLIENT_ID}.apps.googleusercontent.com`;
const BACKEND_URL = `${process.env.REACT_APP_BACKEND_DOMAIN}`;


class AlertDialog extends React.Component {
  render() {
    return <Dialog
      open={this.props.open}
      onCLose={this.props.handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <Toolbar>
          <Typography sx={{flexGrow: 1}}>{this.props.title}</Typography>
          <IconButton edge="end" onClick={this.props.handleClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {this.props.text}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  }
}


class GoogleAuthentification extends React.Component {

  render() {
    if (this.props.userObj) {
      return <GoogleLogout
        clientId={CLIENT_ID}
        onLogoutSuccess={this.props.successLogout}
        onFailure={this.props.failureLogout}
        render={renderProps => <MenuItem onClick={renderProps.onClick} aria-label="logout">
          <Avatar
            alt={this.props.userObj.name}
            src={this.props.userObj.imageUrl}
            onError={(e) => console.log("error loading avatar image", e)}
            sx={{height: "1em", width: "1em"}}
          />
          <Typography>Logout</Typography>
        </MenuItem>}
      />;
    } else {
      return <GoogleLogin
        clientId={CLIENT_ID}
        render={renderProps => <MenuItem onClick={renderProps.onClick} disabled={renderProps.disabled} aria-label="login">
          <Avatar src={`${process.env.PUBLIC_URL}/img/google.svg`} sx={{height: "1em", width: "1em"}} />
          <Typography>Admin login</Typography>
        </MenuItem>}
        onSuccess={this.props.successLogin}
        onFailure={this.props.failureLogin}
        // TODO: unauthorized users get signed in and receive the popup alert every time the menu is opened
        // isSignedIn={true}
      />;
    };
  };
};


class HeaderBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      dialogTitle: "",
      dialogText: "",
      menuAnchor: null,
      userObj: null,
      userToken: "",
    };
  };

  setMenuAnchor = (value) => {
    this.setState({menuAnchor: value});
  };

  successLogin = (googleRes) => {
    fetch(`${BACKEND_URL}/api/user/auth`, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${googleRes.tokenId}`,
      },
    }).then(authRes => {
      if (authRes.ok) {
        this.setState({userObj: googleRes.profileObj, userToken: googleRes.tokenId});
      } else {
        console.error(`User not autorized:`, googleRes);
        this.openDialog("User Not Authorized", "Sorry, you don't have access to these features.");
      };
    }).catch(function(reason) {
      console.error(`Login exception (${reason}):`, googleRes);
      this.openDialog("Authentication Exception", "Something went wrong during login! If it's our fault, we might fix it in the future.");
    });
  };

  failureLogin = (googleRes) => {
    console.error('Google login failure:', googleRes);
    this.openDialog("Google Authentication Service Issue", "Google could not log you in; maybe pray to the tech gods and try again?");
  };

  successLogout = (googleRes) => {
    this.setState({userObj: null, userToken: ""});
  };

  failureLogout = (googleRes) => {
    console.error("Google logout failure:", googleRes);
    this.openDialog("Google Authentication Service Issue", "Google could not log you out; I guess, you are stuck here...");
  };

  openDialog = (title, text) => {
    this.setState({
      dialogOpen: true,
      dialogTitle: title,
      dialogText: text,
    });
  };

  closeDialog = () => {
    this.setState({
      dialogOpen: false,
      dialogTitle: "",
      dialogText: "",
    });
  };

  render() {
    const menuOpen = this.state.menuAnchor != null;

    return (
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            aria-label="menu"
            color="inherit"
            onClick={(ev) => this.setMenuAnchor(ev.currentTarget)}
          >
            <MenuIcon/>
          </IconButton>
          <Menu
            anchorEl={this.state.menuAnchor}
            open={menuOpen}
            onClose={() => this.setMenuAnchor(null)}
            aria-controls={menuOpen ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : undefined}
          >
            <GoogleAuthentification
              userObj={this.state.userObj}
              successLogin={this.successLogin}
              failureLogin={this.failureLogin}
              successLogout={this.successLogout}
              failureLogout={this.failureLogout}
            />
          </Menu>
        </Toolbar>
        <AlertDialog
          open={this.state.dialogOpen}
          title={this.state.dialogTitle}
          text={this.state.dialogText}
          handleClose={this.closeDialog}
        />
      </AppBar>
    )
  };
};

export default HeaderBar;