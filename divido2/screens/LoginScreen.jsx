import { StyleSheet, Text, View, TouchableOpacity, TextInput, BackHandler} from "react-native";
import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({navigation}){

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
      useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
      return () => backHandler.remove()
      }, [])

    const login = async () => {
    if (email.trim() === '' || password.trim() === '') {
        alert('Please fill in all fields');
        return;
    }
    try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            navigation.navigate('Session', {userName: userCredential.user.displayName});
        } catch (error) {
            switch (error.code){
              case 'auth/user-not-found':
              case 'auth/invalid-email':
                alert('No account found with this email.')
                break
              case 'auth/invalid-credential':
                alert('Incorrect password. Please try again.')
            }
        }
    }

    return(
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                      <Text style={styles.backText}>← back</Text>
                    </TouchableOpacity>
             <View style={styles.inner}>
                    <Text style={styles.title}>Login In</Text>
                    <TextInput style={styles.input}
                    placeholder='Your email'
                    value={email}
                    onChangeText={setEmail}/>
                    <TextInput style={styles.input}
                    placeholder='Your password'
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}/>
                    <TouchableOpacity style={styles.button} onPress={login}>
                        <Text style={styles.buttonText}>Login</Text>
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
    borderColor: '#000',
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