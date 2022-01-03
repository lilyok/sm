
import React, { FunctionComponent, useRef, useState } from 'react'
import * as Clipboard from 'expo-clipboard';
import { Linking, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from "react-native-webview";
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import {CART_URL, CATALOG_URL, CONTACTS_URL, INITFULL_URL, LOGIN_URL, LOGOUT_URL, MAIN_COLOR, SECONDARY_COLOR, THANKSFULL_URL} from './src/constants';

//export NODE_OPTIONS=--openssl-legacy-provider 

const styles = StyleSheet.create({
  container: {
    position : 'relative',
  },
  WebViewScrollStyle: {
     flex: 1,
     paddingTop: 50,
     backgroundColor: MAIN_COLOR
  },
  modal : {
      flex : 1,
      justifyContent : 'center',
      alignItems : 'center',
      backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContainer : {
      backgroundColor : SECONDARY_COLOR,
      width : '100%',
      height : '100%',
  },

  logoutScreenButton:{
    marginRight:40,
    marginLeft:40,
    marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor: SECONDARY_COLOR,
    borderRadius:10,
    borderWidth: 2,
    borderColor: MAIN_COLOR
  },
  logoutText:{
      color: MAIN_COLOR,
      textAlign:'center',
      paddingLeft : 10,
      paddingRight : 10,
      fontSize: 23,
  },
});

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}


class LoginWebView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {modalVisible: true};
  }

  _onNavigationStateChange(webViewState){
    if (webViewState.url == INITFULL_URL) {
      this.setState({ modalVisible: false });
    }
  }

  render() {
    return (
      <Modal visible={this.state.modalVisible}>
        <View style={styles.modal}>
          <View style={styles.modalContainer}>
            <WebView style={{ flex : 1 }}
              source={{ uri: LOGIN_URL }}
              onNavigationStateChange={this._onNavigationStateChange.bind(this)}
            />
          </View>
        </View>
      </Modal>
    );
  }

}


class WebViewTab extends React.Component {
  constructor(props) {
    super(props);
    this.url = "";
    this.webViewRef = React.createRef();
    this.state = {
      refreshing: false,
      showLoginWebView: false
    };
  }

  _onRefresh = () => {
    this.setState({refreshing: true});
    this.webViewRef.current.reload();
    wait(2000).then(() => {
      this.setState({refreshing: false});
    });
    // console.log("reload");
  };

  _onNavigationStateChange(webViewState){
    if (webViewState.url == LOGIN_URL) {
      this.setState({showLoginWebView: true})
      this.webViewRef.current.reload();
    } else if (webViewState.url == THANKSFULL_URL) {
      this.webViewRef.current.goBack()
    }
  }

  _onMessage = (message) => {
    // console.log(message.nativeEvent.data);
    const key = "productsCount";
    if (!message.nativeEvent.data.startsWith(key)) {
      return;
    }
    console.log(message.nativeEvent.data)

    const value = message.nativeEvent.data.substring(key.length);

    if (!isNaN(value) && value != "0") {
      this.props.handleProductCountChange(value);
    } else {
      this.props.handleProductCountChange(0);
    }
  }


  render() {
    const injectedJavascript = `(function() {
      window.postMessage = function(data) {
        window.ReactNativeWebView.postMessage(data);
      };
    })()`;
    return (
      <View style={{flex: 1}}>
        { !!this.state.showLoginWebView && <LoginWebView/> }
        <ScrollView 
            contentContainerStyle = {styles.WebViewScrollStyle}
            refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh} 
                />
            }>

          <WebView bounce={false}
            contentContainerStyle = {styles.container}
            ref = {this.webViewRef}
            source={{ uri: this.url }} 
            onNavigationStateChange={this._onNavigationStateChange.bind(this)}
            onMessage={this._onMessage}
            injectedJavaScript={injectedJavascript}
            javaScriptEnabled = {true}
            domStorageEnabled={true}
            startInLoadingState={false}
          />
        </ScrollView>
      </View>
    );
  };
};


class HomeScreen extends WebViewTab {
  constructor(props) {
    super(props);
    this.url = CATALOG_URL;
  };

}

class CartScreen extends WebViewTab {
  constructor(props) {
    super(props);
    this.url = CART_URL;
  };

  componentDidUpdate() {
    // console.log("componentDidUpdate", this.props.productUpdate);
    if (this.props.productUpdate) {
      this.webViewRef.current.reload();
    }
  };
}

class ContactsScreen extends WebViewTab {
  constructor(props) {
    super(props);
    this.url = CONTACTS_URL;
  };
}


const copyToClipboard = () => {
  Clipboard.setString('hello world');
};

const fetchCopiedText = async () => {
  const text = await Clipboard.getStringAsync();
  setCopiedText(text);
};

export class SettingsScreen extends React.Component {

  state={
    logoutWebView: false,
    showLoginWebView: false
  }

  _onLoginStateChange(webViewState){
    this.setState({showLoginWebView: webViewState.url == LOGIN_URL, "logoutWebView": webViewState.url != LOGIN_URL});
  }

  logout() {
    return (
      <WebView
        source={{ uri: LOGOUT_URL }}
        onNavigationStateChange={this._onLoginStateChange.bind(this)}
      />
    );
  }

  render() {
   return (
     <View style={{flex : 1, justifyContent : 'center', alignItems: 'center', backgroundColor: SECONDARY_COLOR}}>
          <TouchableOpacity onPress={copyToClipboard}>
          <View>
            <Text style={{color: 'red', fontSize: 14 , fontFamily:'Arial', fontStyle: 'italic', textAlign: 'center', marginTop: 3, marginLeft: 25, marginBottom: 17}}> 
                        COUPONTEST
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutScreenButton}
          onPress={() => this.setState({logoutWebView: true})}
          underlayColor={ SECONDARY_COLOR }>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
       {/* <Button
          color="#ffffff"
          style={styles.paragraph}
          title="Logout"
          onPress={() => this.setState({logoutWebView: true})}
        />*/}
        { this.state.logoutWebView && this.logout() }
        { !!this.state.showLoginWebView && <LoginWebView/> }
      </View>
   );
  }
}



const Tab = createMaterialBottomTabNavigator();


export class ScreenContainer extends React.Component {

  constructor() {
     super();
     this.state = {
       productCount: 0,
       update: false
     }
  }

  handleProductCountChange = (val) => {
    this.setState({
       update: this.state.productCount == 0 && val > 0 || this.state.productCount != 0 && val == 0
     });
    this.setState({
       productCount: val
     });
  }

  render() {
    return (
      <NavigationContainer theme={{colors:{background: MAIN_COLOR}}}>
        <Tab.Navigator
          initialRouteName="Catalog"
          lazy={false}
          activeColor={ SECONDARY_COLOR }
          inactiveColor="#000000"
          barStyle={{ backgroundColor: MAIN_COLOR }}

       >
          <Tab.Screen name="Catalog"
            options={{
              tabBarLabel: 'Каталог',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="shopping" color={color} size={26} />
              ),
            }}
          >
            {props => <HomeScreen {...props} handleProductCountChange={this.handleProductCountChange} />}
          </Tab.Screen>
          <Tab.Screen name="Cart"
            options={{
              tabBarLabel: 'Корзина',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="cart" color={color} size={26} />
              ),
              tabBarBadge: this.state.productCount == 0 ? null : this.state.productCount
            }}
          >
            {props => <CartScreen {...props} handleProductCountChange={this.handleProductCountChange} productUpdate={this.state.update} />}
          </Tab.Screen>
          <Tab.Screen name="Contacts" component={ContactsScreen}
          options={{
              tabBarLabel: 'Контакты',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="contacts" color={color} size={26} />
              ),
            }}
          />
          <Tab.Screen name="Settings" component={SettingsScreen}
          options={{
              tabBarLabel: 'Личный кабинет',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="account-details" color={color} size={26} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

export default function App() {
  return (
    <ScreenContainer/>
  );
}








