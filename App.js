
import React, { FunctionComponent, useRef, useState } from 'react'
import { Button, Linking, Modal, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { WebView } from "react-native-webview";
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import {CART_URL, CATALOG_URL, CONTACTS_URL, INITFULL_URL, LOGIN_URL, LOGOUT_URL} from './src/constants';

//export NODE_OPTIONS=--openssl-legacy-provider 

const styles = StyleSheet.create({
  container: {
    position : 'relative',
  },
  WebViewScrollStyle: {
     flex: 1,
     paddingTop: 50,
     backgroundColor: '#24b4db'
  },
  ScrollStyle: {
     paddingTop: 50,
     backgroundColor: '#24b4db'
  },
  Settings: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
   backgroundColor: '#ecf0f1',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10
  },

  modal : {
      flex : 1,
      justifyContent : 'center',
      alignItems : 'center',
      backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContainer : {
      backgroundColor : 'white',
      width : '100%',
      height : '100%',
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
      showLoginWebView: false,
    };
  }

  _onRefresh = () => {
    this.setState({refreshing: true});
    this.webViewRef.current.reload();
    wait(2000).then(() => {
      this.setState({refreshing: false});
    });
    console.log("reload");
  };

  _onNavigationStateChange(webViewState){
    if (webViewState.url == LOGIN_URL) {
      this.setState({showLoginWebView: true})
      this.webViewRef.current.reload();
    }
  }

  _onMessage = (message) => {
    // console.log(message.nativeEvent.data);
    if (message.nativeEvent.data.startsWith("productsCount") &&
      !isNaN(message.nativeEvent.data.substring("productsCount".length))) {
      this.props.handleProductCountChange(message.nativeEvent.data.substring("productsCount".length));
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
}

class ContactsScreen extends WebViewTab {
  constructor(props) {
    super(props);
    this.url = CONTACTS_URL;
  };
}


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
     <View style={{flex : 1, justifyContent : 'center', alignItems: 'center'}}>
        <Button
          style={styles.paragraph}
          title="Logout"
          onPress={() => this.setState({logoutWebView: true})}
        />
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
       productCount: 0
     }
  }

  handleProductCountChange = (val) => {
    this.setState({
       productCount: val
     });
  }

  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Catalog"
          lazy={false}
          activeColor="#ffffff"
          inactiveColor="#000000"
          barStyle={{ backgroundColor: '#24b4db' }}

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
            {props => <CartScreen {...props} handleProductCountChange={this.handleProductCountChange} />}
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
              tabBarLabel: 'Настройки',
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








