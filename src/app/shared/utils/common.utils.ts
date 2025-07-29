import { environment } from '../../../environments/environment';

/**
 * Utility functions for common operations
 */
export class CommonUtils {
  
  /**
   * Formats a profile image URL by combining the environment base URL with the relative path
   * @param profileImageUrl - The relative path of the profile image
   * @param fallbackImage - The fallback image path if no profile image is provided
   * @returns The complete URL for the profile image
   */
  static formatProfileImageUrl(profileImageUrl?: string, fallbackImage: string = '/assets/images/default_user.png'): string {
    if (!profileImageUrl) {
      return fallbackImage;
    }
    
    // If the URL already starts with http/https, return as is
    if (profileImageUrl.startsWith('http://') || profileImageUrl.startsWith('https://')) {
      return profileImageUrl;
    }
    
    // If the URL starts with a slash, it's an absolute path from assets
    if (profileImageUrl.startsWith('/')) {
      return profileImageUrl;
    }
    
    // Otherwise, combine with environment URL
    const baseUrl = environment.url.endsWith('/') ? environment.url : environment.url + '/';
    return baseUrl + profileImageUrl;
  }
  
  /**
   * Formats any media URL by combining the environment base URL with the relative path
   * @param mediaUrl - The relative path of the media file
   * @param fallbackUrl - The fallback URL if no media URL is provided
   * @returns The complete URL for the media file
   */
  static formatMediaUrl(mediaUrl?: string, fallbackUrl?: string): string {
    if (!mediaUrl) {
      return fallbackUrl || '';
    }
    
    // If the URL already starts with http/https, return as is
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      return mediaUrl;
    }
    
    // If the URL starts with a slash, it's an absolute path from assets
    if (mediaUrl.startsWith('/')) {
      return mediaUrl;
    }
    
    // Otherwise, combine with environment URL
    const baseUrl = environment.url.endsWith('/') ? environment.url : environment.url + '/';
    return baseUrl + mediaUrl;
  }
}