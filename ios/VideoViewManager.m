//
//  VideoViewManager.m
//  RNDemo
//
//  Created by czf on 2019/5/21.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "ViewVideoManager.h"
#import "VideoView.h"
#import <React/RCTBridgeModule.h>

@interface VideoViewManager ()

@property(weak, nonatomic) VideoView *videoView;

@end

@implementation VideoViewManager

RCT_EXPORT_MODULE(VideoView)

- (UIView *)view {
  VideoView *videoView = [[VideoView alloc] init];
  self.videoView = videoView;
  return videoView; // manager持有videoView的强引用。
}

- (void)dealloc {
  NSLog(@"--==-- view manager dealloc");
}

@end
