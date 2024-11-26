import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import PropTypes from 'prop-types';
import treeIcon from '../assets/tree-icon.png';
import infoIcon from '../assets/info.png';

const MobileTreeDetailsView = ({ route }) => {
  const { tree } = route.params;

  return (
    <View style={styles.container}>
      <Image source={infoIcon} style={styles.info}/>
      <Text style={styles.title}>Tree info</Text>
      <Image source={treeIcon} style={styles.image} />
      <Text style={styles.treeId}>Boom #{tree.id}</Text>
      <View style={styles.dataContainer}>
        <Text style={styles.dataTitle}>Data:</Text>
        <Text style={styles.dataItem}>Height: {tree.height} m</Text>
        <Text style={styles.dataItem}>Diameter: {tree.diameter} m</Text>
        <Text style={styles.dataItem}>Coordinates: {tree.latitude}, {tree.longitude}</Text>
      </View>
    </View>
  );
};

MobileTreeDetailsView.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      tree: PropTypes.shape({
        id: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        diameter: PropTypes.number.isRequired,
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
    alignSelf: 'center',
  },
  treeId: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  dataContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dataItem: {
    fontSize: 16,
    marginBottom: 4,
  },
  info: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 32,
    height: 32,
    resizeMode: 'contain',
  }
});

export default MobileTreeDetailsView;
