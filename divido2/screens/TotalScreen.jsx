import {View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, BackHandler} from 'react-native';
import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'
import { doc, onSnapshot, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
import {auth} from '../firebaseConfig'



const calculateTotals = (items) => {
  const totals = {}
  items.forEach(item => {
    item.claimedBy.forEach(person => {
      const share = Number(item.price) / item.claimedBy.length
      totals[person.name] = (totals[person.name] || 0) + share
    })
  })
  return totals
}


export default function TotalScreen({navigation, route}){

    useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
    }, [])

    const {session, name, uid} = route.params
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

    const totals = calculateTotals(items)
    const userTotal = items.reduce((sum, item) => {
      const claimed = item.claimedBy.some(c => c.uid === uid)
      if (claimed){
        return sum + (Number(item.price) / item.claimedBy.length)
      }
      return sum
    }, 0)
    const totalsArray = Object.entries(totals)

    const handleEnd = () => {
    Alert.alert('are you sure?', 'This will end the session.',[
        {
            text: 'cancel'
        },{
            text: 'yes',
            onPress: async () => {
              const sessionRef = doc(db, 'sessions', session)
              const sessionSnap = await getDoc(sessionRef)
              const memberUids = sessionSnap.data().members.map(m => m.uid)
              const hasAccountUser = memberUids.some(uid => !uid.startsWith('guest_'))
              
              if (hasAccountUser){
                await updateDoc(doc(db, 'sessions', session),{status:'closed'})
                navigation.navigate('Session')
              }
              else {
                await deleteDoc(sessionRef)
                navigation.navigate('Home')}
              }
        }
    ])
}

    return(
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← back</Text>
          </TouchableOpacity>
            <Text style={styles.title}>Bill Summary</Text>
            <Text style={styles.subtitle}>What everyone owes</Text>

            <View>
                <Text>Your total</Text>
                <Text>£{userTotal.toFixed(2)}</Text>
            </View>
            <FlatList
                data={totalsArray}
                keyExtractor={([personName]) => personName}
                style={styles.list}
                renderItem={({item: [personName, personTotal]}) => (
                    <View style={styles.itemRow}>
                        <Text style={styles.itemInfo}>
                            {personName}
                        </Text>
                        <Text>
                            {personTotal.toFixed(2)}
                        </Text>
                    </View>
                )}
            />
            <TouchableOpacity onPress={handleEnd} style={styles.button}>
                <Text style={styles.buttonText}>Done</Text>
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