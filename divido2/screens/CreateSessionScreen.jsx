import { StyleSheet, Text, View, TouchableOpacity, TextInput, BackHandler} from "react-native";
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { auth } from '../firebaseConfig';

export default function CreateSessionScreen({navigation, route}){

    const {userName} = route.params || {}
    const [name, setName] = useState(userName || '');

      useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
      return () => backHandler.remove()
      }, [])

    const generateCode = async () => {
        if (name.trim() === ''){
            alert('Please enter name first');
            return;
        }
        const uid = auth.currentUser?.uid || `guest_${Date.now()}`
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let code = '';
        for (let i = 0; i < 6; i++)
            {
                code += characters.charAt(Math.floor(Math.random() * characters.length))
            }
        
        await setDoc(doc(db, 'sessions', code), {
          code: code,
          host: name,
          hostUid: uid,
          members: [{name: name, uid:uid}], 
          createdAt: new Date(), 
          status: 'waiting',
        })

        if (auth.currentUser){
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            sessions: arrayUnion(code)
          }).catch(async () => {
            await setDoc(doc(db, 'users', auth.currentUser.uid), {
              name: auth.currentUser.displayName,
              email: auth.currentUser.email, 
              sessions: [code]
            })
          })
        }
        
        navigation.navigate('Wait', {name:name, session:code, host:name, hostUid: uid , uid:uid})
    }

    return(
        
        <View style={styles.container}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                      <Text style={styles.backText}>← back</Text>
                    </TouchableOpacity>
                <View style={styles.inner}>
                  <Text style={styles.title}>Create Session</Text>
                  {!userName &&(
                    <TextInput style={styles.input}
                    placeholder='Your name'
                    value={name}
                    onChangeText={setName}
                    />
                  )}

                  {userName && (
                    <Text style={styles.subtitle}>creating as {userName}</Text>
                  )}


                    <TouchableOpacity style={styles.button} onPress={generateCode}>
                        <Text style={styles.buttonText}>Create</Text>
                    </TouchableOpacity>
                </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },

  inner: {
  width: '100%',
  paddingHorizontal: 24,
},
  title: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 8,
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    fontSize: 16,
    marginBottom: 12,
    color: '#1a1a2e',   
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
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
});
