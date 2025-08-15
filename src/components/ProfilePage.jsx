/* eslint-disable */
// src/components/ProfilePage.jsx - Updated with proper shadcn/ui components and auth context
import React, { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  UserCircle,
  Settings,
  Bell,
  Eye,
  BarChart3,
  Clock,
  Bookmark,
  Share,
  Smartphone,
  Sun,
  Moon,
  Globe,
  ShieldCheck,
  Info,
  TrendingUp,
  Flame,
  Newspaper,
  Check,
  User,
  Heart,
  Target,
  Lightbulb,
  Edit,
  Camera,
  Mail,
  Calendar
} from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import SaveForLater from './SaveForLater'
import PersonalInsights from './PersonalInsights'
import RoleManager from './RoleManager'

const ProfilePage = ({
  currentColors,
  theme,
  onThemeChange,
  savedArticles = [],
  onToggleSave,
  onShare,
  onArticleClick,
  userStats = {},
  allFeeds = [],
  lastUpdated,
  className = '',
  user, // Supabase user object
  profile, // User profile with role
  isAuthenticated
}) => {
  // Get auth context for role functions
  const { userRoles, getUserRole, hasRole, isAdmin } = useAuth()
  
  // Enhanced user data with personal insights integration and real auth data
  const userData = useMemo(() => {
    const readArticles = JSON.parse(localStorage.getItem('mukoko_read_articles') || '[]')
    const likedArticles = JSON.parse(localStorage.getItem('mukoko_liked_articles') || '[]')
    const bookmarkedArticles = JSON.parse(localStorage.getItem('mukoko_bookmarks') || '[]')
    const visitHistory = JSON.parse(localStorage.getItem('mukoko_visit_history') || '[]')
    
    const memberSince = visitHistory.length > 0 
      ? new Date(Math.min(...visitHistory.map(v => new Date(v.timestamp))))
      : new Date('2024-01-15')
    
    const daysSince = Math.floor((new Date() - memberSince) / (1000 * 60 * 60 * 24))
    
    // Calculate reading streak
    const calculateStreak = () => {
      if (visitHistory.length === 0) return 0
      
      const dates = visitHistory
        .map(v => new Date(v.timestamp).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index)
        .sort((a, b) => new Date(b) - new Date(a))
      
      let streak = 0
      let currentDate = new Date()
      
      for (let i = 0; i < dates.length; i++) {
        const checkDate = currentDate.toDateString()
        if (dates.includes(checkDate)) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }
      
      return streak
    }

    // Get favorite category
    const categoryCount = readArticles.reduce((acc, read) => {
      const article = allFeeds.find(f => f.id === read.id || f.link === read.link)
      if (article && article.category) {
        acc[article.category] = (acc[article.category] || 0) + 1
      }
      return acc
    }, {})
    
    const favoriteCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Technology'

    return {
      // Use real profile data if available, fallback to defaults
      name: profile?.full_name || user?.email || 'News Reader',
      email: user?.email || 'user@example.com',
      role: profile?.role || 'creator',
      joinDate: user?.created_at ? new Date(user.created_at).toISOString().split('T')[0] : memberSince.toISOString().split('T')[0],
      readingStats: {
        articlesRead: readArticles.length || userStats.articlesRead || 247,
        timeSpent: userStats.timeSpent || '5.2h',
        favoriteCategory: favoriteCategory,
        readingStreak: calculateStreak() || userStats.readingStreak || 12,
        totalLikes: likedArticles.length,
        totalBookmarks: bookmarkedArticles.length,
        totalSessions: visitHistory.length,
        daysSince
      }
    }
  }, [allFeeds, userStats, profile, user])

  const upcomingFeatures = [
    {
      name: 'Advanced Reading Analytics',
      description: 'Deep insights into your reading habits and time patterns',
      icon: BarChart3,
      status: 'Live Now!',
      variant: 'default'
    },
    {
      name: 'Personalized Recommendations',
      description: 'AI-curated news based on your reading history',
      icon: Lightbulb,
      status: 'Live Now!',
      variant: 'default'
    },
    {
      name: 'Push Notifications',
      description: 'Get notified about breaking news and saved articles',
      icon: Bell,
      status: 'Planned',
      variant: 'secondary'
    },
    {
      name: 'Social Sharing',
      description: 'Share and discuss articles with friends',
      icon: Share,
      status: 'Planned',
      variant: 'secondary'
    }
  ]

  const renderEditProfile = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Camera className="h-6 w-6 text-muted-foreground" />
            <span>Profile Picture</span>
          </CardTitle>
          <CardDescription>
            Update your profile avatar
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-pink-500 via-yellow-400 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl font-bold select-none">
                {userData.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Change Avatar
              </Button>
              <p className="text-sm text-muted-foreground">
                JPG, GIF or PNG. 1MB max.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <User className="h-6 w-6 text-muted-foreground" />
            <span>Basic Information</span>
          </CardTitle>
          <CardDescription>
            Update your personal details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input 
              id="name" 
              defaultValue={userData.name}
              placeholder="Your display name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              defaultValue={userData.email}
              placeholder="your@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              placeholder="Tell us about yourself..."
              defaultValue="Passionate about news, technology, and staying informed. #HarareMetro"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              defaultValue="hararemetro.co.zw"
              placeholder="Your website URL"
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-muted-foreground" />
            <span>Account Settings</span>
          </CardTitle>
          <CardDescription>
            Manage your account preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Privacy Settings</h4>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label className="font-medium">Public Profile</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Make your reading stats visible to others
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label className="font-medium">Show Reading Activity</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Display your recent reading activity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Email Preferences</h4>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label className="font-medium">Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get a weekly summary of your reading
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label className="font-medium">Breaking News Alerts</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Important news updates via email
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="lg:col-span-2 border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <div>
              <h4 className="font-semibold text-destructive">Delete Account</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" className="mt-4 sm:mt-0">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Insights Preview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-6 w-6 mr-3 text-primary" />
            Your Reading Journey
          </CardTitle>
          <CardDescription>
            Quick overview of your reading habits and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="p-6 text-center bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <Heart className="h-10 w-10 text-blue-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-1">
                {userData.readingStats.totalLikes}
              </div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Articles Liked
              </div>
            </Card>
            
            <Card className="p-6 text-center bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <Bookmark className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-1">
                {savedArticles.length}
              </div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                Articles Saved
              </div>
            </Card>
            
            <Card className="p-6 text-center bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <Flame className="h-10 w-10 text-orange-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-1">
                {userData.readingStats.readingStreak}
              </div>
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Day Streak
              </div>
            </Card>
            
            <Card className="p-6 text-center bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
              <Eye className="h-10 w-10 text-purple-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-1">
                {userData.readingStats.articlesRead}
              </div>
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Articles Read
              </div>
            </Card>
          </div>
          
          <div className="text-center">
            <Button variant="outline" className="inline-flex items-center space-x-2 px-6 py-3">
              <Lightbulb className="h-5 w-5" />
              <span>View Detailed Insights</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features & Updates */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Features & Updates</CardTitle>
          <CardDescription>
            What's new and what's coming next
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingFeatures.map((feature, index) => (
              <Card key={index} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-xl">
                      <feature.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {feature.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant={feature.variant} className="ml-4">
                    {feature.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderReadingStats = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
              <span>Reading Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-lg">
                      Favorite Category
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Your most read topic
                    </p>
                  </div>
                  <Badge variant="default">
                    {userData.readingStats.favoriteCategory}
                  </Badge>
                </div>
              </Card>
              
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-lg">
                      Reading Level
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Based on your activity
                    </p>
                  </div>
                  <Badge variant="default">
                    {userData.readingStats.articlesRead > 100 ? 'Avid Reader' : 
                     userData.readingStats.articlesRead > 50 ? 'Regular Reader' : 
                     'Getting Started'}
                  </Badge>
                </div>
              </Card>
              
              <Card className="p-5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-lg">
                      Member Duration
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Days since you joined Harare Metro
                    </p>
                  </div>
                  <Badge variant="outline">
                    {userData.readingStats.daysSince} days
                  </Badge>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {userData.readingStats.totalSessions}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Sessions
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {userData.readingStats.timeSpent}
              </div>
              <div className="text-sm text-muted-foreground">
                Time Spent
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderSettings = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-xl">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>
            Customize how the app looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-5 bg-muted rounded-xl">
            <div className="space-y-1">
              <label className="text-lg font-semibold text-foreground">
                Dark Mode
              </label>
              <p className="text-muted-foreground">
                {theme === 'dark' ? 'Dark mode is enabled' : 'Light mode is enabled'}
              </p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={onThemeChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings - Coming Soon */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-xl">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
            <span>Notifications</span>
            <Badge variant="secondary">
              Coming Soon
            </Badge>
          </CardTitle>
          <CardDescription>
            Stay updated with breaking news and your saved articles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-muted rounded-xl">
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-muted-foreground" />
              <div>
                <label className="text-lg font-semibold text-foreground">
                  Breaking News
                </label>
                <p className="text-muted-foreground mt-1">
                  Get notified about important news updates
                </p>
              </div>
            </div>
            <Switch checked={false} disabled />
          </div>
          
          <div className="flex items-center justify-between p-5 bg-muted rounded-xl">
            <div className="flex items-center space-x-4">
              <Smartphone className="h-6 w-6 text-muted-foreground" />
              <div>
                <label className="text-lg font-semibold text-foreground">
                  Push Notifications
                </label>
                <p className="text-muted-foreground mt-1">
                  Receive notifications on your device
                </p>
              </div>
            </div>
            <Switch checked={false} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings - Coming Soon */}
      <Card className="opacity-60 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-xl">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <span>Privacy & Data</span>
            <Badge variant="secondary">
              Coming Soon
            </Badge>
          </CardTitle>
          <CardDescription>
            Control your data and privacy preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-5 bg-muted rounded-xl">
              <div className="flex items-center space-x-4">
                <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                <div>
                  <label className="text-lg font-semibold text-foreground">
                    Data Collection
                  </label>
                  <p className="text-muted-foreground mt-1">
                    Allow anonymous usage analytics
                  </p>
                </div>
              </div>
              <Switch checked={false} disabled />
            </div>
            
            <div className="flex items-center justify-between p-5 bg-muted rounded-xl">
              <div className="flex items-center space-x-4">
                <Globe className="h-6 w-6 text-muted-foreground" />
                <div>
                  <label className="text-lg font-semibold text-foreground">
                    Personalized Content
                  </label>
                  <p className="text-muted-foreground mt-1">
                    Customize content based on reading habits
                  </p>
                </div>
              </div>
              <Switch checked={false} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="bg-muted/50 lg:col-span-2">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Harare Metro News
            </h3>
            <p className="text-muted-foreground">
              Version 2.1.0 • Built with ❤️ in Zimbabwe
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className={`min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <Tabs defaultValue="overview" className="space-y-8">
          {/* Profile Header with integrated tab navigation */}
          <Card>
            <CardContent className="p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
                
                {/* Avatar and Basic Info */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 lg:flex-col lg:items-center lg:space-x-0">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="h-32 w-32 lg:h-40 lg:w-40 rounded-full bg-gradient-to-br from-pink-500 via-yellow-400 to-purple-500 flex items-center justify-center shadow-lg">
                      <span className="text-white text-4xl lg:text-5xl font-bold select-none">
                        {userData.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 mt-4">
                      <Badge variant="default">
                        Active Reader
                      </Badge>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Check className="h-4 w-4" />
                        <span>Verified Member</span>
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Profile Details */}
                  <div className="flex-1 mt-6 sm:mt-0 lg:mt-6 text-center sm:text-left lg:text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                      {userData.name}
                    </h2>
                    
                    {/* User Role Badge */}
                    <div className="flex items-center justify-center sm:justify-start lg:justify-center mt-2">
                      <RoleManager currentRole={userData.role} />
                    </div>
                    
                    <div className="flex items-center justify-center sm:justify-start lg:justify-center space-x-2 mt-2">
                      <span className="text-muted-foreground font-mono">@newsreader</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        Member since {new Date(userData.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    
                    {/* Bio */}
                    <div className="mt-4 text-muted-foreground max-w-md">
                      <p>
                        Passionate about news, technology, and staying informed. <span className="text-primary">#HarareMetro</span>
                      </p>
                    </div>
                    
                    {/* Website Link */}
                    <div className="mt-3">
                      <a
                        href="https://hararemetro.co.zw"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        hararemetro.co.zw
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="flex-1 mt-8 lg:mt-0">
                  <div className="grid grid-cols-3 gap-6 lg:gap-8">
                    <div className="text-center">
                      <div className="text-2xl lg:text-3xl font-bold text-foreground">
                        {userData.readingStats.totalLikes}
                      </div>
                      <div className="text-sm lg:text-base text-muted-foreground uppercase tracking-wide">
                        Likes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl lg:text-3xl font-bold text-foreground">
                        {userData.readingStats.articlesRead}
                      </div>
                      <div className="text-sm lg:text-base text-muted-foreground uppercase tracking-wide">
                        Articles
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl lg:text-3xl font-bold text-foreground">
                        {userData.readingStats.readingStreak}
                      </div>
                      <div className="text-sm lg:text-base text-muted-foreground uppercase tracking-wide">
                        Streak
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tab Navigation - Properly positioned under profile */}
              <div className="mt-4 p-2 border-t border-border gap-2 item-center justify-center">
                <TabsList className="inline-flex items-center justify-around gap-2">
                  <TabsTrigger 
                    value="overview" 
                    className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <UserCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights" 
                    className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Insights</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="saved" 
                    className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span className="hidden sm:inline">Saved</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="edit" 
                    className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardContent>
          </Card>
          
          {/* Tab Content */}
          <TabsContent value="overview" className="mt-8">
            {renderOverview()}
          </TabsContent>
          
          <TabsContent value="insights" className="mt-8">
            <PersonalInsights 
              currentColors={currentColors} 
              allFeeds={allFeeds || []}
              lastUpdated={lastUpdated}
            />
          </TabsContent>
          
          <TabsContent value="saved" className="mt-8">
            <SaveForLater
              savedArticles={savedArticles}
              onToggleSave={onToggleSave}
              onShare={onShare}
              onArticleClick={onArticleClick}
              currentColors={currentColors}
            />
          </TabsContent>
          
          <TabsContent value="edit" className="mt-8">
            {renderEditProfile()}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-8">
            {renderSettings()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ProfilePage