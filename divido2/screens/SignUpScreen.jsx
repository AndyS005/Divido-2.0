import { StyleSheet, Text, View, TouchableOpacity, TextInput, BackHandler} from "react-native";
import { useState, useEffect} from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function SignUpScreen({navigation}){

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

      useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
      return () => backHandler.remove()
      }, [])

    const signUp = async () => {
        if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
            alert('Please fill in all fields');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            navigation.navigate('Session', {userName: name});
        } catch (error) {
            alert(error.message);
        }
    }

    return(
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                      <Text style={styles.backText}>← back</Text>
                    </TouchableOpacity>
             <View style={styles.inner}>
                    <Text style={styles.title}>Creating your account</Text>
                    <TextInput style={styles.input}
                    placeholder='Your email'
                    value={email}
                    onChangeText={setEmail}/>
                    <TextInput style={styles.input}
                    placeholder='Your password'
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}/>
                    
                    <TextInput style={styles.input}
                    placeholder='Your name'
                    value={name}
                    onChangeText={setName}/>

                    <TouchableOpacity style={styles.button} onPress={signUp}>
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