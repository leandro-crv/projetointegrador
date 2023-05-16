import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Card, Appbar, Portal, Dialog, Button, Provider, IconButton, Modal, Divider, Text, RadioButton, Checkbox } from 'react-native-paper';
import { ActivityIndicator } from 'react-native-paper';
import Constants from 'expo-constants';
import axios from 'axios';


export default function App() {
  const baseUrl = 'http://10.0.2.2:3000/atrativo'
  const [uf, setUf] = useState('todas');
  const [contemplacao, setContemplacao] = useState(true);
  const [trilha, setTrilha] = useState(true);
  const [praia, setPraia] = useState(true);
  const [open, setOpen] = useState(false);
  const openDialog = () => setOpen(!open);
  const [modalVisible, setModalVisible] = useState(false);
  const [totalAtrativos, setTotalAtrativos] = useState(0);
  const [atrativos, setAtrativos] = useState([]);
  const [atrativosFavoritos, setAtrativosFavoritos] = useState([]);

  const handleModal = async () => {
    setModalVisible(!modalVisible);
    if (!modalVisible) {
      await getAtrativosFavoritos();
    }
    else {
      await getAtrativos(baseUrl);
    }
  };

  const getAtrativosFavoritos = async () => {
    axios.get(`${baseUrl}?favorito=true`)
      .then(response => {
        setAtrativosFavoritos(response.data)
      })
      .catch(error => console.log(error))
    return
  }
  useEffect(() => {
    (async () => {
      await getAtrativos(baseUrl);
    }
    )()
  }, [])
  const search = async () => {
    openDialog();
    let url = 'http://10.0.2.2:3000/atrativo';
    if (uf !== 'todas') {
      url += `?uf=${uf}`;
    }

    if (contemplacao || trilha || praia) {
      if (url.match(/\?/, 'gi')) {
        url += '&'
      }
      else {
        url += '?'
      }
      if (contemplacao) url += 'categoria=contemplação&';
      if (trilha) url += 'categoria=trilha&';
      if (praia) url += 'categoria=praia';

      let ultimaLetra = url[url.length - 1]
      if (ultimaLetra == '&' || ultimaLetra == '?') {
        url = url.substring(0, url.length - 1);
      }
      await getAtrativos(url)
    }
    else{
      setTotalAtrativos(0);
      setAtrativos([]);
    }
    return
  };

  const getAtrativos = async (url) => {
    axios.get(url)
      .then(response => {
        setTotalAtrativos(response.data.length);
        setAtrativos(response.data);
      })
      .catch(error => console.log(error))
    return
  }

  const handleFavorite = async (id, favorito) => {
    axios.patch(`${baseUrl}/${id}`, { favorito: !favorito })
      .then(function (response) {
        if (modalVisible) {
          getAtrativosFavoritos()
        }
        else {
          getAtrativos(baseUrl);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    return
  }
  const containerStyle = { backgroundColor: 'white', padding: 20 };
  
  const Item = ({ uf, cidade, nome, img, descricao, id, categoria, favorito }) => (
    <Card>
      <Card.Cover source={{ uri: img }} />
      <Card.Title title={nome} subtitle={`${cidade} - ${uf}`} />
      <Card.Content>
        <Text variant="bodyMedium">{categoria}</Text>
        <Text variant="bodyMedium">{descricao}</Text>
      </Card.Content>
      <Card.Actions>
        <IconButton
          icon={favorito ? "heart" : "heart-outline"}
          color={"red"}
          size={20}
          onPress={() => handleFavorite(id, favorito)}
        />
      </Card.Actions>
    </Card>
  );

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="GPTrip" />
          <Appbar.Action icon="heart" onPress={handleModal} />
          <Appbar.Action icon="magnify" onPress={openDialog} />
        </Appbar.Header>
        <Portal>
          <Dialog visible={open} onDismiss={openDialog}>
            <Dialog.Title>Buscar</Dialog.Title>
            <Dialog.Content>
              <View>
                <Text>Selecione a UF</Text>
                <View style={styles.inputLabel}>
                  <RadioButton
                    value="todas"
                    status={uf === 'todas' ? 'checked' : 'unchecked'}
                    onPress={() => setUf('todas')}
                  />
                  <Text>Todas</Text>
                </View>
                <View style={styles.inputLabel}>
                  <RadioButton
                    value="RS"
                    status={uf === 'RS' ? 'checked' : 'unchecked'}
                    onPress={() => setUf('RS')}
                  />
                  <Text>RS</Text>
                </View>
                <View style={styles.inputLabel}>
                  <RadioButton
                    value="SC"
                    status={uf === 'SC' ? 'checked' : 'unchecked'}
                    onPress={() => setUf('SC')}
                  />
                  <Text>SC</Text>
                </View>
                <Divider />
                <Text>Tipo de atrativo:</Text>
                <View style={styles.inputLabel}>
                  <Checkbox
                    value="contemplacao"
                    status={contemplacao ? 'checked' : 'unchecked'}
                    onPress={() => setContemplacao(!contemplacao)}
                  />
                  <Text>Contemplação</Text>
                </View>
                <View style={styles.inputLabel}>
                  <Checkbox
                    value="trilha"
                    status={trilha ? 'checked' : 'unchecked'}
                    onPress={() => setTrilha(!trilha)}
                  />
                  <Text>Trilha</Text>
                </View>
                <View style={styles.inputLabel}>
                  <Checkbox
                    value="praia"
                    status={praia ? 'checked' : 'unchecked'}
                    onPress={() => setPraia(!praia)}
                  />
                  <Text>Praia</Text>
                </View>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={search}>Buscar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <View style={styles.resultado}>
          <Text style={styles.label}>{totalAtrativos} resultados encontrados </Text>
        </View>
        <Divider />
        <FlatList
          data={atrativos}
          renderItem={({ item }) =>
            <Item
              id={item.id}
              uf={item.uf}
              cidade={item.cidade}
              nome={item.nome}
              img={item.img}
              descricao={item.descricao}
              categoria={item.categoria}
              favorito={item.favorito}
            />}
          keyExtractor={item => item.id}
        />
        <Portal>
          <Modal visible={modalVisible} onDismiss={handleModal} contentContainerStyle={containerStyle}>
            <FlatList
              data={atrativosFavoritos}
              renderItem={({ item }) =>
                <Item
                  id={item.id}
                  uf={item.uf}
                  cidade={item.cidade}
                  nome={item.nome}
                  img={item.img}
                  descricao={item.descricao}
                  categoria={item.categoria}
                  favorito={item.favorito}
                />}
              keyExtractor={item => item.id}
            />
          </Modal>
        </Portal>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultado: {
    display: 'flex',
    gap: 4,
    padding: 16
  },
  label: {
    fontSize: 12
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});