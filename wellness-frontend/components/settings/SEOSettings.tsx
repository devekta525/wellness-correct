'use client'

import React from 'react'
import { Upload, Edit, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface SeoData {
  siteTitle: string
  siteDescription: string
  siteKeywords: string
  ogImage: string
  twitterHandle: string
  googleAnalytics: string
  facebookPixel: string
  sitemapUrl: string
  robotsTxt: string
  thirdPartyScripts: {
    googleTagManager: string
    hotjar: string
    intercom: string
    zendesk: string
    customScripts: string
  }
  metaTags: {
    author: string
    robots: string
    viewport: string
    themeColor: string
    customMetaTags: string
  }
}

interface SEOSettingsProps {
  seoData: SeoData
  setSeoData: React.Dispatch<React.SetStateAction<SeoData>>
  editStates: { seo: boolean }
  isLoading: boolean
  onEdit: (section: string) => void
  onCancel: (section: string) => void
  onSave: (section: string) => void
}

const SEOSettings: React.FC<SEOSettingsProps> = ({
  seoData,
  setSeoData,
  editStates,
  isLoading,
  onEdit,
  onCancel,
  onSave
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Configure your website&apos;s search engine optimization</CardDescription>
          </div>
          {!editStates.seo ? (
            <Button onClick={() => onEdit('seo')} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit SEO
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => onCancel('seo')} variant="outline" disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={() => onSave('seo')} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="siteTitle">Site Title</Label>
          <Input
            id="siteTitle"
            value={seoData.siteTitle}
            onChange={(e) => setSeoData({...seoData, siteTitle: e.target.value})}
            placeholder="Your website title"
            disabled={!editStates.seo}
          />
          <p className="text-sm text-muted-foreground mt-1">Recommended: 50-60 characters</p>
        </div>

        <div>
          <Label htmlFor="siteDescription">Meta Description</Label>
          <Textarea
            id="siteDescription"
            value={seoData.siteDescription}
            onChange={(e) => setSeoData({...seoData, siteDescription: e.target.value})}
            rows={3}
            placeholder="Brief description of your website"
            disabled={!editStates.seo}
          />
          <p className="text-sm text-muted-foreground mt-1">Recommended: 150-160 characters</p>
        </div>

        <div>
          <Label htmlFor="siteKeywords">Keywords</Label>
          <Input
            id="siteKeywords"
            value={seoData.siteKeywords}
            onChange={(e) => setSeoData({...seoData, siteKeywords: e.target.value})}
            placeholder="keyword1, keyword2, keyword3"
            disabled={!editStates.seo}
          />
          <p className="text-sm text-muted-foreground mt-1">Separate keywords with commas</p>
        </div>

        <div>
          <Label htmlFor="ogImage">Open Graph Image</Label>
          <div className="flex items-center gap-4">
            <Input
              id="ogImage"
              value={seoData.ogImage}
              onChange={(e) => setSeoData({...seoData, ogImage: e.target.value})}
              placeholder="https://example.com/og-image.jpg"
              disabled={!editStates.seo}
            />
            <Button variant="outline" size="sm" disabled={!editStates.seo}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Recommended: 1200x630px</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="twitterHandle">Twitter Handle</Label>
            <Input
              id="twitterHandle"
              value={seoData.twitterHandle}
              onChange={(e) => setSeoData({...seoData, twitterHandle: e.target.value})}
              placeholder="@yourhandle"
              disabled={!editStates.seo}
            />
          </div>
          <div>
            <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
            <Input
              id="googleAnalytics"
              value={seoData.googleAnalytics}
              onChange={(e) => setSeoData({...seoData, googleAnalytics: e.target.value})}
              placeholder="GA-XXXXXXXXX-X"
              disabled={!editStates.seo}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Third-Party Scripts</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="googleTagManager">Google Tag Manager ID</Label>
              <Input
                id="googleTagManager"
                value={seoData.thirdPartyScripts.googleTagManager}
                onChange={(e) => setSeoData({
                  ...seoData,
                  thirdPartyScripts: {
                    ...seoData.thirdPartyScripts,
                    googleTagManager: e.target.value
                  }
                })}
                placeholder="GTM-XXXXXXX"
                disabled={!editStates.seo}
              />
              <p className="text-sm text-muted-foreground mt-1">Your Google Tag Manager container ID</p>
            </div>
            <div>
              <Label htmlFor="hotjar">Hotjar Site ID</Label>
              <Input
                id="hotjar"
                value={seoData.thirdPartyScripts.hotjar}
                onChange={(e) => setSeoData({
                  ...seoData,
                  thirdPartyScripts: {
                    ...seoData.thirdPartyScripts,
                    hotjar: e.target.value
                  }
                })}
                placeholder="1234567"
                disabled={!editStates.seo}
              />
              <p className="text-sm text-muted-foreground mt-1">Your Hotjar site tracking ID</p>
            </div>
            <div>
              <Label htmlFor="intercom">Intercom App ID</Label>
              <Input
                id="intercom"
                value={seoData.thirdPartyScripts.intercom}
                onChange={(e) => setSeoData({
                  ...seoData,
                  thirdPartyScripts: {
                    ...seoData.thirdPartyScripts,
                    intercom: e.target.value
                  }
                })}
                placeholder="xxxxxxxx"
                disabled={!editStates.seo}
              />
              <p className="text-sm text-muted-foreground mt-1">Your Intercom application ID</p>
            </div>
            <div>
              <Label htmlFor="zendesk">Zendesk Widget Key</Label>
              <Input
                id="zendesk"
                value={seoData.thirdPartyScripts.zendesk}
                onChange={(e) => setSeoData({
                  ...seoData,
                  thirdPartyScripts: {
                    ...seoData.thirdPartyScripts,
                    zendesk: e.target.value
                  }
                })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                disabled={!editStates.seo}
              />
              <p className="text-sm text-muted-foreground mt-1">Your Zendesk widget key</p>
            </div>
            <div>
              <Label htmlFor="customScripts">Custom Scripts</Label>
              <Textarea
                id="customScripts"
                value={seoData.thirdPartyScripts.customScripts}
                onChange={(e) => setSeoData({
                  ...seoData,
                  thirdPartyScripts: {
                    ...seoData.thirdPartyScripts,
                    customScripts: e.target.value
                  }
                })}
                placeholder="<!-- Custom tracking scripts -->&#10;&lt;script&gt;&#10;  // Your custom JavaScript code here&#10;&lt;/script&gt;"
                rows={6}
                disabled={!editStates.seo}
              />
              <p className="text-sm text-muted-foreground mt-1">Add custom JavaScript code for tracking, analytics, or other third-party services</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Meta Tags</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metaAuthor">Author</Label>
                <Input
                  id="metaAuthor"
                  value={seoData.metaTags.author}
                  onChange={(e) => setSeoData({
                    ...seoData,
                    metaTags: {
                      ...seoData.metaTags,
                      author: e.target.value
                    }
                  })}
                  placeholder="Author Name"
                  disabled={!editStates.seo}
                />
              </div>
              <div>
                <Label htmlFor="metaRobots">Robots</Label>
                <Select 
                  value={seoData.metaTags.robots} 
                  onValueChange={(value) => setSeoData({
                    ...seoData,
                    metaTags: {
                      ...seoData.metaTags,
                      robots: value
                    }
                  })}
                  disabled={!editStates.seo}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select robots directive" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index, follow">Index, Follow</SelectItem>
                    <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                    <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                    <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="metaViewport">Viewport</Label>
                <Input
                  id="metaViewport"
                  value={seoData.metaTags.viewport}
                  onChange={(e) => setSeoData({
                    ...seoData,
                    metaTags: {
                      ...seoData.metaTags,
                      viewport: e.target.value
                    }
                  })}
                  placeholder="width=device-width, initial-scale=1"
                  disabled={!editStates.seo}
                />
              </div>
              <div>
                <Label htmlFor="metaThemeColor">Theme Color</Label>
                <Input
                  id="metaThemeColor"
                  value={seoData.metaTags.themeColor}
                  onChange={(e) => setSeoData({
                    ...seoData,
                    metaTags: {
                      ...seoData.metaTags,
                      themeColor: e.target.value
                    }
                  })}
                  placeholder="#10b981"
                  disabled={!editStates.seo}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customMetaTags">Custom Meta Tags</Label>
              <Textarea
                id="customMetaTags"
                value={seoData.metaTags.customMetaTags}
                onChange={(e) => setSeoData({
                  ...seoData,
                  metaTags: {
                    ...seoData.metaTags,
                    customMetaTags: e.target.value
                  }
                })}
                placeholder="&lt;meta name=&quot;custom&quot; content=&quot;value&quot;&gt;&#10;&lt;meta property=&quot;og:type&quot; content=&quot;website&quot;&gt;&#10;&lt;meta name=&quot;twitter:card&quot; content=&quot;summary_large_image&quot;&gt;"
                rows={6}
                disabled={!editStates.seo}
              />
              <p className="text-sm text-muted-foreground mt-1">Add custom meta tags for Open Graph, Twitter Cards, or other specific requirements</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SEOSettings
