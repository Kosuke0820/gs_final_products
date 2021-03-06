import React from 'react';
import { Route } from 'react-router-dom';
import firebase from 'firebase';
import { Button, Popup, Loader } from 'semantic-ui-react';
import Message from 'react-icons/lib/io/ios-chatbubble-outline';

import ImageList from './ImageList';
import ItemDetail from '../components/ItemDetail';
import StaffList from '../components/StaffList';


class UserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      want: true,
      favorite: false,
      clothete: false,
      post: true,
      staff: false,
      userData: [],
      allDataList: [],
      dataList: [],
      staffList: [],
    };
    this.filterDataList = this.filterDataList.bind(this);
    this.loadUserImage = this.loadUserImage.bind(this);
  }

  componentWillMount() {
    if (this.props.match.params.id) {
      this.loadUserImage(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this.setState({ staff: false });
      this.loadUserImage(nextProps);
    }
  }

  loadUserImage(props) {
    const userId = props.match.params.id;
    const db = firebase.firestore();
    db.collection('users').doc(userId)
      .get()
      .then((querySnapshot) => {
        const staffList = [];
        if (querySnapshot.data().type === 'shop') {
          db.collection('users')
            .where('shopId', '==', userId)
            .get()
            .then((_querySnapshot) => {
              _querySnapshot.forEach((_doc) => {
                staffList.push(Object.assign(_doc.data(), { key: _doc.id }));
              });
              this.setState({
                userData: querySnapshot.data(),
                staffList,
              });
            });
        } else {
          this.setState({
            userData: querySnapshot.data(),
          });
        }
        const allDataList = [];
        const dataList = [];
        if (querySnapshot.data().type === 'shop') {
          db.collection('collections')
            .where('user', '==', userId)
            .get()
            .then((_querySnapshot) => {
              _querySnapshot.forEach((doc) => {
                dataList.push(doc.data());
              });
              dataList.sort((a, b) => (
                a.createdOnNumber < b.createdOnNumber ? 1 : -1
              ));
              this.setState({ dataList });
            });
        } else {
          db.collection(`users/${userId}/status`).orderBy('createdOnNumber', 'desc')
            .get()
            .then((_querySnapshot) => {
              if (_querySnapshot.docs.length === 0) {
                this.setState({
                  allDataList,
                  dataList,
                });
                return;
              }
              _querySnapshot.forEach((doc) => {
                db.collection('collections').doc(doc.id)
                  .get()
                  .then((__querySnapshot) => {
                    const combineData = Object.assign(doc.data(), __querySnapshot.data());
                    allDataList.push(combineData);
                    if (combineData.want) {
                      dataList.push(combineData);
                    }
                    this.setState({
                      allDataList,
                      dataList,
                    });
                  });
              });
            });
        }
      })
      .catch(() => {
        const { history } = props;
        history.push('/404');
      });
  }


  filterDataList(status) {
    const { allDataList } = this.state;
    const dataList = [];
    for (let i = 0, len = allDataList.length; len > i; i += 1) {
      if (allDataList[i][status]) {
        dataList.push(allDataList[i]);
      }
    }
    if (status === 'want') {
      this.setState({
        want: true,
        favorite: false,
        clothete: false,
        dataList,
      });
    } else if (status === 'favorite') {
      this.setState({
        want: false,
        favorite: true,
        clothete: false,
        dataList,
      });
    } else {
      this.setState({
        want: false,
        favorite: false,
        clothete: true,
        dataList,
      });
    }
  }

  render() {
    if (this.state.userData.length === 0) {
      return (
        <Loader
          active
          inline="centered"
          style={{ marginTop: '30vh' }}
        />
      );
    }
    const userId = this.props.match.params.id;
    let message = '';
    if (userId !== this.props.myId) {
      message = (
        <Popup
          trigger={
            <Message
              className="message-icon"
              onClick={() => this.props.openMessageBox(userId)}
            />
          }
          content="メッセージを送信する"
          position="bottom center"
          style={{ padding: 8, color: '#555', fontSize: 12 }}
        />
      );
    }

    let buttonGroup = '';
    if (this.state.userData.type === 'shop') {
      buttonGroup = (
        <Button.Group>
          <Button
            active={this.state.post}
            className="shop-status-button"
            onClick={() => this.setState({
              post: true,
              staff: false,
            })}
          >
            Post
          </Button>
          <Button
            active={this.state.staff}
            className="shop-status-button"
            onClick={() => this.setState({
              post: false,
              staff: true,
            })}
          >
            Staff
          </Button>
        </Button.Group>
      );
    } else {
      buttonGroup = (
        <Button.Group>
          <Button
            active={this.state.want}
            className="status-button"
            onClick={() => this.filterDataList('want')}
          >
            Want
          </Button>
          <Button
            active={this.state.favorite}
            className="status-button"
            onClick={() => this.filterDataList('favorite')}
          >
            Style
          </Button>
          <Button
            active={this.state.clothete}
            className="status-button"
            onClick={() => this.filterDataList('clothete')}
          >
            Closet
          </Button>
        </Button.Group>
      );
    }

    return (
      <div className="user-page-wrapper" >
        <div
          className="user-page-top"
          style={{ backgroundImage: `url(${this.state.userData.backgroundImage})` }}
        >
          { message }
          <div
            style={{ backgroundImage: `url(${this.state.userData.userImage})` }}
            className="user-image"
          />
          {/* <img src={this.state.userData.userImage} alt="" /> */}
          <h2>{this.state.userData.userName}</h2>
          <p>{this.state.userData.userText}</p>
          { buttonGroup }
        </div>
        { this.state.staff ? (
          <StaffList
            staffList={this.state.staffList}
            query={this.props.match.url}
          />
        ) : (
          <ImageList
            dataList={this.state.dataList}
            query={this.props.match.url}
          />
        )
        }
        <Route
          exact
          path="/main/:id/:query"
          render={props => (
            <ItemDetail
              myId={this.props.myId}
              myData={this.props.myData}
              {...props}
            />
          )}
        />
      </div>
    );
  }
}

export default UserPage;
