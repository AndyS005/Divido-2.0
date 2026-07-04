import {View, Text, StyleSheet, FlatList, TouchableOpacity, BackHandler} from 'react-native';
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'
import { doc, onSnapshot, updateDoc} from 'firebase/firestore'


export default function SplitScreen({route, navigation}){
    const {name, session, uid} = route.params
    const [items, setItems] = useState([])

    useEffect(() => {
          const sessionRef = doc(db, 'sessions', session)
          const leave = onSnapshot(sessionRef, (snap) => {
            if (snap.exists()){
              setItems(snap.data().items)
            }
          })
          return () => leave()
        }, [])

    useEffect(() => {
     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
    }, [])

  const claimItem = async (item) => {
  const sessionRef = doc(db, 'sessions', session)
  const claimed = item.claimedBy.some(c => c.uid === uid)

  const updatedItems = items.map(i => {
    if (i.id !== item.id) return i
    return {
      ...i,
      claimedBy: claimed ? i.claimedBy.filter(c => c.uid !== uid) : [...i.claimedBy, {name:name, uid:uid}]
    }
  })

  await updateDoc(sessionRef, { items: updatedItems })
}

    const userTotal = items.reduce((sum, item) => {
        if (item.claimedBy.some(c => c.uid === uid)){
            return sum + (Number(item.price) / item.claimedBy.length)
        }
        return sum
    },0)

    return(
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← back</Text>
          </TouchableOpacity>
            <FlatList
                data={items}
                keyExtractor={item => item.id}
                style={styles.list}
                renderItem={({item}) => {
                    const alreadyClaim = item.claimedBy.some(c => c.uid === uid)
                    const splitPrice = item.claimedBy.length > 0 ? Number(item.price) / item.claimedBy.length : Number(item.price)

                    return (
                        <TouchableOpacity onPress={() => claimItem(item)} style={alreadyClaim && styles.itemRowClaimed}>
                            <View style={styles.itemRow}>
                                <View style={styles.itemInfo}> 
                                    <Text style={styles.itemName}>
                                     {item.name}
                                    </Text>
                                    <Text style={styles.itemPrice}>
                                        £{splitPrice.toFixed(2)}
                                    </Text>
                                </View>
                                <Text>
                                    {item.claimedBy.length > 0 ? item.claimedBy.map(c => c.name).join(', ') : 'unclaimed'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>your total</Text>
                <Text style={styles.totalAmount}>£{userTotal.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Total', {session: session, name: name, uid: uid})}>
                <Text style={styles.buttonText}>confirm my selection</Text>
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
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
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

  itemRowClaimed: {
  backgroundColor: '#f0f7f0',
},
itemInfo: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  flex: 1,
},
claimedBy: {
  fontSize: 12,
  color: '#999',
  marginTop: 4,
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
  color: '#1a1a2e',
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

});