import {View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, BackHandler} from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'
import { doc, updateDoc } from 'firebase/firestore'

const readItems = (lines) => {
  console.log('raw lines:', lines)
  const priceRegex = /[£E]?(\d+\.?\s*\d{2})/
  const standalonePriceRegex = /^[£E2]?(\d+\.?\s*\d{2})\s*[A-Z]?$/
  const skipWords = [
    'total', 'subtotal', 'tax', 'vat', 'cash', 'change',
    'receipt', 'non vat', 'card', 'gross', 'net',
    'qty', 'description', 'rate', 'price', 'item', 'guests',
    'sales', 'last', 'tbl', 'chk', 'no of', 'restaurant'
  ]

  const skipPatterns = [
    /^\*/, //lines like '* bbq'
    /^\d{2}\/\d{2}\/\d{4}/, //dates
    /^#/, //headers like #1
    /^\d+$/, // stand alone numbers 
    /^[A-Z][a-z]+$/,// single capatalised words
    /^O\.\d{2}$/,// ocr misread
    /^0\.00$/,// 0.00
    /^\d+\s+@\s+[\d.]+$/,// 2 @ 15.50
    /^\d+@/,// 2@
    /^\d+[\(\.\)]+$/, // catches any combination of digits with brackets and dots
    /^\d+\(\.?\)$/,
    /^[\)\s]+$/,
    ]

  const names = []
  const prices = []

  for (let line of lines){
    const trimmed = line.trim()
    if (trimmed.length < 3 ){
      continue
    } 
    if (skipPatterns.some(pattern => pattern.test(trimmed))){
      continue
    }
    if (skipWords.some(word => trimmed.toLowerCase().includes(word))){
      continue
    }

    if (trimmed.toLowerCase().includes('service charge')) {
      names.push('Service Charge')
      continue
    }


    const doublePrice = trimmed.match(/^[\d\s]*(\d+\.\d{2})\s+\1$/)
    if (doublePrice) {
      prices.push(parseFloat(doublePrice[1]))
      continue
    }


    const normalised = trimmed.replace(',','.')
    const priceMatch = normalised.match(priceRegex)
    if (priceMatch){
      if (standalonePriceRegex.test(normalised))
        {prices.push(parseFloat(priceMatch[1].replace(/\s/g,'')))}
      
    }
    else{
        let cleanName = trimmed
        const menuPrefix = trimmed.match(/^\d+\.\s+(.+)/i)
        if (menuPrefix) {
          cleanName = menuPrefix[1].trim()
        }

        if (cleanName.length > 1 && !/^[-*#]+$/.test(cleanName)) {
          names.push(cleanName)
        }
      }
    }
    return names.map((name,index)=> ({
    id: index.toString(),
    name: name,
    price : prices[index] ?? 0,
  }))
}


export default function ItemsScreen({route, navigation}){

    const {rawText, session, name, uid} = route.params;
    const [items, setItems] = useState(readItems(rawText));
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
                                    £{Number(item.price).toFixed(2)}
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