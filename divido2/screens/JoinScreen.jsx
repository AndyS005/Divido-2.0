import { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, BackHandler} from 'react-native';
import { db } from '../firebaseConfig'
import { doc, updateDoc, getDoc, arrayUnion , setDoc} from 'firebase/firestore'
import { auth } from '../firebaseConfig'

export default function JoinScreen({navigation, route}){
  

    const {userName} = route.params || {}
    const [code, setCode] = useState('');
    const [name, setName] = useState(userName || '');

      useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
      return () => backHandler.remove()
      }, [])

    const joinSession = async () => {
      if (name.trim() === '' || code.trim() === ''){
        alert('Please enter both your session code and name')
        return;
      }
      const sessionRef = doc(db, 'sessions', code.toUpperCase())
      const sessionSnap = await getDoc(sessionRef) 

      if (!sessionSnap.exists()){
        alert('Session not found. Please check the code and try again.')
        return
      }
      const status = sessionSnap.data().status

      if (status === 'closed'){
        alert('This session has already ended')
        return
      }
      if (status === 'active'){
      alert('This session is already in progess and no longer accepting.')
      return
      }

      if (auth.currentUser){
        await updateDoc(doc(db, 'users', auth.currentUser.uid),{
          sessions: arrayUnion(code.toUpperCase())
        }).catch(async () => {
          await setDoc(doc(db, 'users', auth.currentUser.uid), {
            name: auth.currentUser.displayName,
            email: auth.currentUser.email,
            sessions: [code]
          })
        })
      }

      const host = sessionSnap.data().host
      const uid = auth.currentUser?.uid || `guest_${Date.now()}`
      await updateDoc(sessionRef, {
        members: arrayUnion({name:name, uid:uid})
      })
      const hostUid = sessionSnap.data().hostUid
      navigation.navigate('Wait', {name: name, session: code.toUpperCase(), host:host, hostUid: hostUid, uid:uid})

    }

    return(
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← back</Text>
          </TouchableOpacity>
            <Text style={styles.title}>Join a session</Text>
            <Text style={styles.subtitle}>enter your details below</Text>

            <TextInput style={styles.input}
            placeholder='Session code'
            value={code}
            onChangeText={setCode}/>

            {!userName && (            
            <TextInput style={styles.input}
            placeholder='Your name'
            value={name}
            onChangeText={setName}/>)}

            {userName && (
              <Text>Joining as {userName}</Text>
            )}

            <TouchableOpacity style={styles.buttonsecondary} onPress={joinSession}>
                <Text>Join</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },

    buttonsecondary: {
    borderWidth: 1,
    borderColor: '#1a1a2e',
     padding: 16,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    marginTop: 12,
    },

    input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 16,
    borderRadius: 12,
    width: '60%',
    fontSize: 16,
    marginBottom: 12,
    color: '#1a1a2e',   
    backgroundColor: '#fff',
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