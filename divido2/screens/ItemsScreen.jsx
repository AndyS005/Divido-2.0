import {View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, BackHandler} from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'
import { doc, updateDoc } from 'firebase/firestore'

export default function ItemsScreen({route, navigation}){

    const {extractedData, session, name, uid} = route.params;

    const initialItems = (extractedData?.items || []).map((item, index) => ({
      id: index.toString(),
      name: item.name,
      price: parseFloat((item.line_total || item.unit_price || '0').replace(/[^0-9.]/g, '')) || 0,
      quantity: parseInt(item.quantity) || 1,
    }));

    const [items, setItems] = useState(initialItems);
    const [editingId, setEditingId] = useState(null);

    const deleteItem = (id) => {
        setItems(items.filter(item => item.id !== id))
    }

    const confirmItems = async () => {
      if (items.length === 0){
        alert('No items to confirm')
        return
      }
      await updateDoc(doc(db, 'sessions', session),{
        items: items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity) || 1,
          claimedBy: []
        }))
      })
      navigation.navigate('Split', {session: session, name:name, uid: uid})
    }

    const addItem = () => {
      const newItem = {
        id: Date.now().toString(),
        name: 'New Item',
        price: 0,
      }
      setItems([...items, newItem])
      setEditingId(newItem.id)
    }

    const total = items.reduce((sum, item) => sum + Number(item.price), 0)

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Review items</Text>
            <Text style={styles.subtitle}>Edit or remove any incorrect items</Text>

            <FlatList
                data={items}
                keyExtractor={item => item.id}
                style={styles.list}
                renderItem={({item}) => (
                    <View style={styles.itemRow}>
                      {editingId === item.id ? (
                        <View style={styles.itemInfo}>
                          <TextInput
                            style={[styles.itemName, styles.editInput]}
                            value = {item.name}
                            onChangeText={(text) => setItems(items.map(i => i.id === item.id ? {...i, name: text} : i))}
                          />
                          <TextInput
                            style={[styles.itemPrice, styles.editInput]}
                            value = {item.price.toString()}
                            keyboardType='numeric'
                            onChangeText={(text) => setItems(items.map(i => i.id === item.id ? {...i, price: (text)} : i))}
                          />
                          <TextInput
                            style={[styles.itemPrice, styles.editInput]}
                            value = {item.quantity.toString()}
                            keyboardType='numeric'
                            onChangeText={(text) => setItems(items.map(i => i.id === item.id ? {...i, quantity: (text)} : i))}
                          />
                          <TouchableOpacity onPress={() => setEditingId(null)} style={styles.saveButton}>
                            <Text style={styles.saveText}>✓</Text>
                          </TouchableOpacity>
                        </View>) : (
                          <View style={styles.itemInfo}>
                              <TouchableOpacity onPress={() => setEditingId(item.id)}>
                                <Text style={styles.itemName}>
                                  {item.name}
                                </Text>
                                <Text style={styles.itemPrice}>
                                    £{Number(item.price).toFixed(2)} · qty {item.quantity}
                                </Text>
                              </TouchableOpacity> 
              
                            <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
                                <Text style={styles.buttonText}>
                                    X
                                </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                    </View>
                  )}
                />

            <TouchableOpacity style={styles.addButton} onPress={addItem}>
               <Text style={styles.addButtonText}>+ add items</Text>
            </TouchableOpacity>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                    Total
                </Text>
                <Text style={styles.totalAmount}>
                    £{total.toFixed(2)}
                </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={confirmItems}>
                <Text style={styles.buttonText}>
                    Confirm items
                </Text>

            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  list: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    color: '#1a1a2e',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  deleteButton: {
    fontSize: 16,
    backgroundColor: '#8B0000',
    padding: 11,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },

  backButton: {
  position: 'absolute',
  top: 60,
  left: 24,
},
backText: {
  fontSize: 16,
  color: '#1a1a2e',
},

editInput: {
  borderBottomWidth: 1,
  borderBottomColor: '#1a1a2e',
  padding: 4,
  minWidth: 80,
},
saveButton: {
  backgroundColor: '#1a1a2e',
  padding: 8,
  borderRadius: 8,
  alignItems: 'center',
  marginLeft: 8,
},
saveText: {
  color: '#fff',
  fontSize: 16,
}
});