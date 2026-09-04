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

  const updateClaim = async (item, delta) => {
    const sessionRef = doc(db, 'sessions', session)
    const existingClaim = item.claimedBy.find(c => c.uid === uid)
    const currentQty = existingClaim ? existingClaim.qty : 0

    const totalClaimedByOthers = item.claimedBy
      .filter(c => c.uid !== uid)
      .reduce((sum, c) => sum + c.qty, 0)

    const itemQty = item.quantity ?? 1
    const remaining = itemQty - totalClaimedByOthers - currentQty
    const newQty = currentQty + delta

    if (newQty < 0) return
    if (delta > 0 && remaining <= 0) return

    let updatedClaimedBy
    if (newQty === 0) {
      updatedClaimedBy = item.claimedBy.filter(c => c.uid !== uid)
    } else if (existingClaim) {
      updatedClaimedBy = item.claimedBy.map(c => c.uid === uid ? {...c, qty: newQty} : c)
    } else {
      updatedClaimedBy = [...item.claimedBy, {name: name, uid: uid, qty: newQty}]
    }

    const updatedItems = items.map(i => i.id === item.id ? {...i, claimedBy: updatedClaimedBy} : i)

    await updateDoc(sessionRef, { items: updatedItems })
  }

  const userTotal = items.reduce((sum, item) => {
      const myClaim = item.claimedBy.find(c => c.uid === uid)
      if (!myClaim) return sum

      const totalClaimedQty = item.claimedBy.reduce((s, c) => s + c.qty, 0)
      const pricePerUnit = Number(item.price) / (item.quantity ?? 1)

      return sum + (pricePerUnit * myClaim.qty)
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
                  const myClaim = item.claimedBy.find(c => c.uid === uid)
                  const myQty = myClaim ? myClaim.qty : 0
                  const totalClaimedQty = item.claimedBy.reduce((sum, c) => sum + c.qty, 0)
                  const itemQty = item.quantity ?? 1
                  const remaining = itemQty - totalClaimedQty

                  return (
                      <View style={[styles.itemRow, myQty > 0 && styles.itemRowClaimed]}>
                          <View style={styles.itemInfo}>
                              <Text style={styles.itemName}>{item.name}</Text>
                              <Text style={styles.itemPrice}>£{Number(item.price).toFixed(2)} · {remaining} left</Text>
                              <Text style={styles.claimedBy}>
                                  {item.claimedBy.length > 0
                                    ? item.claimedBy.map(c => `${c.name} (${c.qty})`).join(', ')
                                    : 'unclaimed'}
                              </Text>
                          </View>

                          <View style={styles.stepper}>
                              <TouchableOpacity
                                onPress={() => updateClaim(item, -1)}
                                disabled={myQty === 0}
                                style={[styles.stepperButton, myQty === 0 && styles.stepperButtonDisabled]}
                              >
                                  <Text style={styles.stepperButtonText}>−</Text>
                              </TouchableOpacity>

                              <Text style={styles.stepperQty}>{myQty}</Text>

                              <TouchableOpacity
                                onPress={() => updateClaim(item, 1)}
                                disabled={remaining === 0}
                                style={[styles.stepperButton, remaining === 0 && styles.stepperButtonDisabled]}
                              >
                                  <Text style={styles.stepperButtonText}>+</Text>
                              </TouchableOpacity>
                          </View>
                      </View>
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
stepper: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
stepperButton: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '#1a1a2e',
  alignItems: 'center',
  justifyContent: 'center',
},
stepperButtonDisabled: {
  backgroundColor: '#ccc',
},
stepperButtonText: {
  color: '#fff',
  fontSize: 18,
  fontWeight: '600',
},
stepperQty: {
  fontSize: 16,
  fontWeight: '600',
  minWidth: 20,
  textAlign: 'center',
},

});