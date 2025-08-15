import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Loader2, User, Mail, Calendar, Settings, LogOut, Edit, Save, X } from 'lucide-react'
import { format } from 'date-fns'

const UserProfile = () => {
  const { user, profile, updateProfile, signOut, loading } = useAuth()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
    preferences: {
      theme: profile?.preferences?.theme || 'dark',
      notifications: profile?.preferences?.notifications || true,
      email_updates: profile?.preferences?.email_updates || false
    }
  })

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setEditData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const { error } = await updateProfile(editData)
      if (!error) {
        setIsEditing(false)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      full_name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || '',
      preferences: {
        theme: profile?.preferences?.theme || 'dark',
        notifications: profile?.preferences?.notifications || true,
        email_updates: profile?.preferences?.email_updates || false
      }
    })
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Not Signed In</h3>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">
                  {profile?.full_name || 'Anonymous User'}
                </CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </CardDescription>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    Member since {profile?.created_at ? 
                      format(new Date(profile.created_at), 'MMM yyyy') : 
                      'Recently'
                    }
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="full-name"
                  value={editData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {profile?.full_name || 'Not set'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar-url">Avatar URL</Label>
              {isEditing ? (
                <Input
                  id="avatar-url"
                  value={editData.avatar_url}
                  onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                  placeholder="Enter avatar URL"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {profile?.avatar_url || 'Not set'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                {user.email_confirmed_at ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for the application
                </p>
              </div>
              {isEditing ? (
                <Switch
                  checked={editData.preferences.theme === 'dark'}
                  onCheckedChange={(checked) => 
                    handleInputChange('preferences.theme', checked ? 'dark' : 'light')
                  }
                />
              ) : (
                <Badge variant="outline">
                  {profile?.preferences?.theme || 'dark'}
                </Badge>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for new articles
                </p>
              </div>
              {isEditing ? (
                <Switch
                  checked={editData.preferences.notifications}
                  onCheckedChange={(checked) => 
                    handleInputChange('preferences.notifications', checked)
                  }
                />
              ) : (
                <Badge variant="outline">
                  {profile?.preferences?.notifications ? 'On' : 'Off'}
                </Badge>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates and newsletters
                </p>
              </div>
              {isEditing ? (
                <Switch
                  checked={editData.preferences.email_updates}
                  onCheckedChange={(checked) => 
                    handleInputChange('preferences.email_updates', checked)
                  }
                />
              ) : (
                <Badge variant="outline">
                  {profile?.preferences?.email_updates ? 'On' : 'Off'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default UserProfile