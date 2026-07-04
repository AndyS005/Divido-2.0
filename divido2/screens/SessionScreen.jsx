import { StyleSheet, Text, View, TouchableOpacity, BackHandler } from "react-native";
import { auth } from '../firebaseConfig'
import { useEffect } from "react";


export default function SessionScreen({navigation, route}){
  const userName = route.params?.userName || auth.currentUser?.displayName || null

    useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
    }, [])

    return(
      
        <View style={styles.container}>
                              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                      <Text style={styles.backText}>← back</Text>
                    </TouchableOpacity>
            <Text style={styles.title}>Divido</Text>

            {auth.currentUser && (
              <TouchableOpacity onPress={() => navigation.navigate('Account')} style={styles.accountButton}>
                <Text style={styles.accountButtonText}>Account</Text>
              </TouchableOpacity>
            )}
            {userName && (
              <Text>Welcome {userName}</Text>
            )}
            <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('Create', {userName:userName})}>
                <Text style={styles.buttonText}>create a session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonsecondary} onPress={() => navigation.navigate('Join', {userName: userName})}>
                <Text style={styles.buttonSeconText}>join a session</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
  },
  buttonPrimary: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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
buttonSeconText: {
  color: '#1a1a2e',
  fontSize: 16,
},

accountButton: {
  position: 'absolute',
  top: 60,
  right: 24,
},
accountButtonText: {
  fontSize: 16,
  color: '#1a1a2e',
},
  title: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 40,
    color: '#1a1a2e',
  },
    backButton: {
  position: 'absolute',
  top: 60,
  left: 24,
},
});