import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import ShopList from '../components/ShopList';


// eslint-disable-next-line
class ShopListScreen extends React.Component {
  render() {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ShopList navigation={this.props.navigation} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ShopListScreen;