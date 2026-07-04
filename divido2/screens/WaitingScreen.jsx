import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, BackHandler} from "react-native";
import { useState, useEffect, useRef } from 'react';
import { db } from '../firebaseConfig'
import { doc, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore'


export default function WaitingScreen({route, navigation}){

    useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
    }, [])

    const {name, session, host, hostUid, uid} = route.params;
    const [members, setMembers] = useState([])
    const [sessionStatus, setSessionStatus] = useState('waiting')


    useEffect(() => {
      const sessionRef = doc(db, 'sessions', session)
      const leave = onSnapshot(sessionRef, (snap) => {
        if (snap.exists()){
          const data = snap.data()
          setMembers(snap.data().members)
          setSessionStatus(data.status)
          if (data.items && data.items.length > 0 && uid !== hostUid) {

            navigation.navigate('Split', {session: session, name: name, uid:uid})
          } 
        }
      })
      return () => leave()
    }, [])

    const handleLeave = () => {
        Alert.alert('Leave session?', 'You will lose your session code.',[
            {
                text: 'cancel'
            },{
                text: 'yes',
                onPress: async () => { 
                await updateDoc(doc(db, 'sessions', session), {
                    members: arrayRemove({ name: name, uid: uid })
                })
                navigation.navigate('Home')
              }
            }
        ])
    }

    return(
        <View style={styles.container}>
          <TouchableOpacity onPress={handleLeave} style={styles.backButton}>
                                <Text style={styles.backText}>← back</Text>
                              </TouchableOpacity>
            <Text style={styles.title}>
                Session Code - {session}
            </Text>

            <FlatList
              data={members}
              keyExtractor={(item, index) => index.toString()}
              style={styles.list}
              renderItem={({item}) => (
                <View style={styles.memberRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.name[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.memberName}>
                    {item.name}
                  </Text>
                </View>
              )}
            />
            
            <View>
              {sessionStatus === 'active' ? (                <Text style={styles.subtitle}>
                    Host is scanning...
                </Text>) : (                <Text style={styles.subtitle}>
                    Waiting for others...
                </Text>)}

            </View>
            {uid === hostUid && (<TouchableOpacity style={styles.button} onPress={async () => {await updateDoc(doc(db,'sessions', session),{status:'active'}) 
            navigation.navigate('Scan', {session: session, name: name, uid:uid})}}>
                <Text style={styles.buttonText}>
                    Scan Receipt
                </Text>
            </TouchableOpacity>)}

        </View>
    )

}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 150,
  },

    title: {
    fontSize: 30,
    fontWeight: '500',
    marginBottom: 8,
    color: '#1a1a2e',
    },

    name: {
    fontSize: 20,
    fontWeight: '200',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },

    button: {
  backgroundColor: '#1a1a2e',
  padding: 16,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 32,
  marginBottom: 24,
  width: '100%',
},
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },

  membersLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#1a1a2e',
  },
  list: {
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  memberName: {
    fontSize: 16,
    color: '#1a1a2e',
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

});