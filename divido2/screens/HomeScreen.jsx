import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export default function HomeScreen({navigation}){
    return(
      
        <View style={styles.container}>
            <Text style={styles.title}>Divido</Text>
            <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('Session')}>
                <Text style={styles.buttonText}>Continue as guest</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonsecondary} onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.buttonSeconText}>Create Account</Text>
            </TouchableOpacity>
            <View>
                <TouchableOpacity style={styles.buttonsecondary} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.linkText}>Already have an account? sign in </Text>
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

linkText: {
  color: '#1a1a2e',
  fontSize: 14,
},


});