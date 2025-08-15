/* eslint-env browser */
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Mail, Lock, User, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/utils'
import { generateRandomUsername, isValidUsername, formatUsernameFromName } from '../../utils/usernameGenerator'

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const { signIn, signUp, resetPassword, updatePassword, error, loading, user } = useAuth()
  
  // Close modal when authentication succeeds
  useEffect(() => {
    if (user && isOpen) {
      // User is authenticated and modal is open, close it
      onClose()
    }
  }, [user, isOpen, onClose])
  
  const [activeTab, setActiveTab] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [isSettingNewPassword, setIsSettingNewPassword] = useState(false)

  // Update active tab when initialMode changes
  useEffect(() => {
    if (initialMode === 'reset-password') {
      setActiveTab('reset')
      setIsSettingNewPassword(true) // User is setting new password, not requesting reset
    } else {
      setActiveTab(initialMode)
      setIsSettingNewPassword(false)
    }
  }, [initialMode])

  // Generate default username when switching to signup tab and no username exists
  useEffect(() => {
    if (activeTab === 'signup' && !formData.username) {
      const defaultUsername = generateRandomUsername()
      setFormData(prev => ({ ...prev, username: defaultUsername }))
    }
  }, [activeTab, formData.username])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear username error when user types
    if (field === 'username') {
      setUsernameError('')
    }
    
    // Auto-generate username suggestion when full name changes
    if (field === 'fullName' && !formData.username) {
      const suggestion = formatUsernameFromName(value)
      setFormData(prev => ({ ...prev, username: suggestion }))
    }
  }

  const generateNewUsername = () => {
    const newUsername = generateRandomUsername()
    setFormData(prev => ({ ...prev, username: newUsername }))
    setUsernameError('')
  }

  const validateUsername = (username) => {
    if (!username) {
      return 'Username is required'
    }
    
    if (!isValidUsername(username)) {
      if (username.length < 3) return 'Username must be at least 3 characters'
      if (username.length > 20) return 'Username must be less than 20 characters'
      if (/^[0-9]/.test(username)) return 'Username cannot start with a number'
      if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores'
    }
    
    return ''
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // First, check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setIsSubmitting(false)
      return
    }
    
    try {
      const { error } = await signIn(formData.email, formData.password)
      
      if (!error) {
        // Success - modal will close automatically via App.jsx useEffect when isAuthenticated becomes true
        setFormData({ email: '', password: '', fullName: '', confirmPassword: '' })
      }
    } catch {
      // Error handling - let the auth hook handle error display
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return
    }
    
    // Validate username
    const usernameValidation = validateUsername(formData.username)
    if (usernameValidation) {
      setUsernameError(usernameValidation)
      return
    }
    
    setIsSubmitting(true)
    setUsernameError('')
    
    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        username: formData.username
      })
      if (!error) {
        setActiveTab('signin')
        setFormData({ email: '', password: '', fullName: '', username: '', confirmPassword: '' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!formData.email) {
      setUsernameError('Please enter your email address')
      return
    }
    
    setIsSubmitting(true)
    setUsernameError('')
    
    try {
      const { error } = await resetPassword(formData.email)
      if (!error) {
        setResetEmailSent(true)
        // Don't clear email so user can see which email it was sent to
      } else {
        setUsernameError(error.message || 'Failed to send reset link')
      }
    } catch {
      setUsernameError('Failed to send reset link. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    if (!formData.password) {
      setUsernameError('Please enter a new password')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setUsernameError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      setUsernameError('Password must be at least 6 characters long')
      return
    }
    
    setIsSubmitting(true)
    setUsernameError('')
    
    try {
      if (updatePassword) {
        const { error } = await updatePassword(formData.password)
        if (!error) {
          // Password updated successfully, close modal
          handleClose()
        } else {
          setUsernameError(error.message || 'Failed to update password')
        }
      } else {
        // Fallback: use Supabase directly
        const { supabase } = await import('../../lib/supabase')
        const { error } = await supabase.auth.updateUser({ password: formData.password })
        if (!error) {
          handleClose()
        } else {
          setUsernameError(error.message || 'Failed to update password')
        }
      }
    } catch {
      setUsernameError('Failed to update password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setFormData({ email: '', password: '', fullName: '', username: '', confirmPassword: '' })
    setActiveTab('signin')
    setResetEmailSent(false)
    setUsernameError('')
  }

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-full h-screen w-screen p-0 m-0 rounded-none border-0">
        <div className="h-full w-full flex flex-col bg-background">
          {/* Header */}
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                {resetEmailSent ? 'Check Your Email' : 'Welcome to Mukoko'}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
              {resetEmailSent ? (
                <div className="space-y-6 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Check Your Email</h3>
                      <p className="text-muted-foreground">
                        We&apos;ve sent a password reset link to
                      </p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertDescription className="text-left">
                      <strong>Next steps:</strong>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li>• Check your email inbox</li>
                        <li>• Click the reset link in the email</li>
                        <li>• Follow the instructions to set a new password</li>
                        <li>• Check your spam folder if you don&apos;t see it</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setResetEmailSent(false)
                        setActiveTab('signin')
                        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
                      }}
                      className="w-full"
                    >
                      Back to Sign In
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setResetEmailSent(false)
                        // Keep the email filled in case they want to try again
                      }}
                      className="w-full text-sm"
                    >
                      Resend Reset Link
                    </Button>
                  </div>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    <TabsTrigger value="reset">Reset</TabsTrigger>
                  </TabsList>

            <TabsContent value="signin" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signup-username">Username</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateNewUsername}
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Generate
                    </Button>
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={cn(
                        "pl-10",
                        usernameError && "border-red-500"
                      )}
                      required
                    />
                  </div>
                  {usernameError && (
                    <p className="text-sm text-red-500">{usernameError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Your username will be visible to other users
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={cn(
                        "pl-10 pr-10",
                        formData.password && formData.confirmPassword && 
                        formData.password !== formData.confirmPassword && 
                        "border-red-500"
                      )}
                      required
                    />
                  </div>
                  {formData.password && formData.confirmPassword && 
                   formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-500">Passwords do not match</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || loading || 
                           formData.password !== formData.confirmPassword ||
                           !formData.username ||
                           usernameError}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reset" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {usernameError && (
                <Alert variant="destructive">
                  <AlertDescription>{usernameError}</AlertDescription>
                </Alert>
              )}

              {isSettingNewPassword ? (
                // Form for setting new password (after clicking reset link)
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Set New Password</h3>
                    <p className="text-muted-foreground text-sm">
                      Enter your new password below
                    </p>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting || loading || !formData.password || !formData.confirmPassword}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </form>
                </div>
              ) : (
                // Form for requesting password reset (normal flow)
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Reset Your Password</h3>
                    <p className="text-muted-foreground text-sm">
                      Enter your email address and we&apos;ll send you a link to reset your password
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={cn(
                            "pl-10",
                            usernameError && "border-red-500"
                          )}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting || loading || !formData.email}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Reset Link...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>
                  
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveTab('signin')}
                      className="text-sm"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthModal