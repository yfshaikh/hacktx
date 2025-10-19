export function handleEmailLoginError (error: any) {

    let errorMessage = "An error occurred while signing in. Please try again."
    switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address. Please check your email or sign up for a new account."
          break
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please check your password and try again."
          break
        case 'auth/invalid-email':
          errorMessage = "The email address is invalid. Please enter a valid email."
          break
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled. Please contact support for assistance."
          break
        case 'auth/too-many-requests':
          errorMessage = "Too many failed login attempts. Please try again later or reset your password."
          break
        case 'auth/invalid-credential':
          errorMessage = "Invalid email or password. If you don't have an account, please sign up first."
          break
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection and try again."
          break
        case 'auth/configuration-not-found':
          errorMessage = "Authentication configuration error. Please contact support."
          break
        default:
          errorMessage = error.message || errorMessage
          break
      }
      
      return errorMessage
}

export function handleSupabaseLoginError(error: any) {
  let errorMessage = "An error occurred while signing in. Please try again."
  
  switch (error.message) {
    case 'Invalid login credentials':
      errorMessage = "Invalid email or password. If you don't have an account, please sign up first."
      break
    case 'Email not confirmed':
      errorMessage = "Please check your email and click the confirmation link before signing in."
      break
    case 'Too many requests':
      errorMessage = "Too many failed login attempts. Please try again later."
      break
    case 'User not found':
      errorMessage = "No account found with this email address. Please check your email or sign up for a new account."
      break
    case 'Invalid email':
      errorMessage = "The email address is invalid. Please enter a valid email."
      break
    default:
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. If you don't have an account, please sign up first."
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before signing in."
      } else {
        errorMessage = error.message || errorMessage
      }
      break
  }
  
  return errorMessage
}

export function handleSupabaseSignupError(error: any) {
  let errorMessage = "An error occurred while creating your account. Please try again."
  
  switch (error.message) {
    case 'User already registered':
      errorMessage = "An account with this email already exists. Please try logging in instead."
      break
    case 'Password should be at least 6 characters':
      errorMessage = "The password is too weak. Please choose a stronger password (at least 6 characters)."
      break
    case 'Invalid email':
      errorMessage = "The email address is invalid. Please enter a valid email."
      break
    case 'Signup is disabled':
      errorMessage = "Account creation is currently disabled. Please contact support."
      break
    default:
      if (error.message?.includes('already registered')) {
        errorMessage = "An account with this email already exists. Please try logging in instead."
      } else if (error.message?.includes('Password')) {
        errorMessage = "The password is too weak. Please choose a stronger password."
      } else {
        errorMessage = error.message || errorMessage
      }
      break
  }
  
  return errorMessage
}

export function handleGoogleLoginError(googleError: any) {
    let errorMessage = "An error occurred while signing in with Google. Please try again."
      
      switch (googleError.code) {
        case 'auth/account-exists-with-different-credential':
          errorMessage = "An account already exists with the same email address but different sign-in credentials."
          break
        case 'auth/auth-domain-config-required':
          errorMessage = "Google sign-in is not properly configured. Please contact support."
          break
        case 'auth/cancelled-popup-request':
          errorMessage = "Sign-in was cancelled. Please try again."
          break
        case 'auth/operation-not-allowed':
          errorMessage = "Google sign-in is not enabled. Please contact support."
          break
        case 'auth/operation-not-supported-in-this-environment':
          errorMessage = "Google sign-in is not supported in this environment."
          break
        case 'auth/popup-blocked':
          errorMessage = "Sign-in popup was blocked by your browser. Please allow popups and try again."
          break
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign-in was cancelled. Please try again."
          break
        case 'auth/unauthorized-domain':
          errorMessage = "This domain is not authorized for Google sign-in."
          break
        default:
          errorMessage = googleError.message || errorMessage
          break
      }

      return errorMessage
}

export function handleSupabaseGoogleError(error: any) {
  let errorMessage = "An error occurred while signing in with Google. Please try again."
  
  switch (error.message) {
    case 'OAuth provider not supported':
      errorMessage = "Google sign-in is not enabled. Please contact support."
      break
    case 'Invalid OAuth provider':
      errorMessage = "Google sign-in is not properly configured. Please contact support."
      break
    case 'OAuth error':
      errorMessage = "Google sign-in was cancelled or failed. Please try again."
      break
    default:
      if (error.message?.includes('OAuth')) {
        errorMessage = "Google sign-in failed. Please try again or use email/password instead."
      } else {
        errorMessage = error.message || errorMessage
      }
      break
  }
  
  return errorMessage
}