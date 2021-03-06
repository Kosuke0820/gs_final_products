import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import firebase from 'firebase';

import UserAccounts from '../components/UserAccounts';

const { width } = Dimensions.get('window');

class MessageBoxScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      messageRooms: [],
      loading: true,
    };
  }

  componentWillMount() {
    const { currentUser } = firebase.auth();
    const db = firebase.firestore();
    let messageList = [];
    db.collection('messages')
      .where('postUserId', '==', currentUser.uid)
      .onSnapshot((querySnapshot) => {
        messageList = [];
        querySnapshot.forEach((doc) => {
          messageList.push(doc.data());
        });
        db.collection('messages')
          .where('otherId', '==', currentUser.uid)
          .get()
          .then((_querySnapshot) => {
            _querySnapshot.forEach((_doc) => {
              messageList.push(_doc.data());
            });
            if (messageList.length === 0) {
              this.setState({
                loading: false,
              });
              return;
            }
            const adjustList = {};
            const messageRoom = [];
            messageList.sort((a, b) => (
              a.createdOn > b.createdOn ? 1 : -1
            ));
            for (let i = 0; i < messageList.length; i++) {
              adjustList[messageList[i]['messageRoom']] = messageList[i];
            }
            // eslint-disable-next-line
            for (let key in adjustList) {
              messageRoom.push(adjustList[key]);
            }
            messageRoom.sort((a, b) => (
              a.createdOn < b.createdOn ? 1 : -1
            ));
            const messageRooms = [];
            messageRoom.forEach((data) => {
              let userId = data.postUserId;
              if (userId === currentUser.uid) {
                userId = data.otherId;
              }
              db.collection('users/').doc(userId)
                .get()
                .then((__querySnapshot) => {
                  console.log('きてます2')
                  messageRooms.push(Object.assign(data, __querySnapshot.data()));
                  this.setState({
                    messageRooms,
                    loading: false,
                  });
                });
            });
          });
      });
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#777" />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <UserAccounts navigation={this.props.navigation} data={this.state.messageRooms} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
  },
  searchArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: 16,
  },
  searchInput: {
    backgroundColor: '#ddd',
    width: width / 1.1,
    fontSize: 18,
    padding: 8,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 5,
  },
});

export default MessageBoxScreen;
