//
//  VideoView.m
//  RNDemo
//
//  Created by czf on 2019/5/21.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "VideoView.h"
#import "JDMediaDecoder.h"
#import <AVFoundation/AVFoundation.h>

@interface VideoView ()

@property(strong, nonatomic) NSString *lessonId;
@property(strong, nonatomic) NSString *sectionId;

@property(strong, nonatomic) NSString *localUrl;
@property(assign, nonatomic) BOOL canPrepare;

@property(strong, nonatomic) AVPlayer *player;
@property(strong, nonatomic) AVPlayerLayer *playerLayer;
@property(strong, nonatomic) AVPlayerItem *playerItem;

@end

@implementation VideoView

- (instancetype)init {
  self = [super init];
  [self registerDecoderEvent];
  [self startDecoder];
  return self;
}

- (void)layoutSubviews { // maybe called more than once
  [super layoutSubviews];
  self.playerLayer.frame =
    CGRectMake(0, 0, self.bounds.size.width, self.bounds.size.height);
}

- (void)dealloc {
  NSLog(@"--==-- view dealloc");
  [self.player pause];
  [[NSNotificationCenter defaultCenter] removeObserver:self];
  [self.playerItem removeObserver:self
                       forKeyPath:@"status"
                          context:nil];
  [self.playerItem removeObserver:self
                       forKeyPath:@"loadedTimeRanges"
                          context:nil];
  [self.playerItem removeObserver:self
                       forKeyPath:@"playbackBufferEmpty"
                          context:nil];
  [JDMediaDecoder stop_decoder];
  [JDMediaDecoder destroy_decoder];
}

- (void)registerDecoderEvent {
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(keyAvailable:)
                                               name:DECODER_EVENT_KEY_AVAILABLE
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(canPrepare:)
                                               name:DECODER_EVENT_CAN_PREPARE
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(gotLocalUrl:)
                                               name:DECODER_EVENT_GOT_LOCAL_URL
                                             object:nil];
}

/*
 * add_item后，会同步调用
 */
- (void)keyAvailable:(NSNotification *)notification {
  [JDMediaDecoder prepare_to_decode:nil lid:self.lessonId sid:self.sectionId];
}

/*
 * 启动下载线程，本地下载128K后，会在下载线程调用canPrepare，如果本地已经有了128k，立马调用。
 * 启动下载线程后，之前的线程会通知gotLocalUrl。
 * 因为是两个线程，canPrepare和gotLocalUrl不能保证调用顺序。
 */
- (void)canPrepare:(NSNotification *)notification {
  self.canPrepare = YES;
  if (self.localUrl != nil) {
    [self playVideoWithUrl:self.localUrl];
  }
}

/*
 * 启动下载线程，本地下载128K后，会在下载线程调用canPrepare，如果本地已经有了128k，立马调用。
 * 启动下载线程后，之前的线程会通知gotLocalUrl。
 * 因为是两个线程，canPrepare和gotLocalUrl不能保证调用顺序。
 */
- (void)gotLocalUrl:(NSNotification *)notification {
  //self.localUrl = (NSString *)notification.object;
  //self.localUrl = @"http://www.largesound.com/ashborytour/sound/brobob.mp3";
  //self.localUrl = @"http://portal-portm.sankuai.com/trip_biz_app/audio_test";
  self.localUrl = @"http://portal-portm.sankuai.com/trip_biz_app/audio_test.mp3";
  if (self.canPrepare) {
    [self playVideoWithUrl:self.localUrl];
  }
}

- (void)playVideoWithUrl:(NSString *)url {
  //NSURL *_url =
    //[NSURL URLWithString:@"http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"];
  NSURL *_url = [NSURL URLWithString:url];
  
  self.playerItem = [[AVPlayerItem alloc] initWithURL:_url];
  [self.playerItem addObserver:self
                    forKeyPath:@"status"
                       options:NSKeyValueObservingOptionNew
                       context:nil];
  [self.playerItem addObserver:self
                    forKeyPath:@"loadedTimeRanges"
                       options:NSKeyValueObservingOptionNew
                       context:nil];
  [self.playerItem addObserver:self
                    forKeyPath:@"playbackBufferEmpty"
                       options:NSKeyValueObservingOptionNew
                       context:nil];
  [self playVideo];
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey, id> *)change
                       context:(void *)context {
  if ([keyPath isEqualToString:@"status"]) {
    //取出status的新值
    AVPlayerItemStatus status = [change[NSKeyValueChangeNewKey] intValue];
    switch (status) {
      case AVPlayerItemStatusFailed:
        NSLog(@"--==-- status failed: %@", [[self.playerItem error] description]);
        break;
      case AVPlayerItemStatusReadyToPlay:
        NSLog(@"准好播放了");
        break;
      case AVPlayerItemStatusUnknown:
        NSLog(@"--==-- status unknown: %@", [[self.playerItem error] description]);
        break;
      default:
        break;
    }
  }
}

- (void)playVideo {
  NSDictionary *settings = @{
    (id)kCVPixelBufferPixelFormatTypeKey:
      [NSNumber numberWithInt:kCVPixelFormatType_32BGRA]
  };
  AVPlayerItemVideoOutput *videoOutput =
    [[AVPlayerItemVideoOutput alloc] initWithPixelBufferAttributes:settings];
  [self.playerItem addOutput:videoOutput];
  
  self.player = [[AVPlayer alloc] initWithPlayerItem:self.playerItem];
  
  self.playerLayer = [AVPlayerLayer playerLayerWithPlayer:self.player];
  self.playerLayer.frame = self.bounds;
  [self.layer addSublayer:self.playerLayer];
  
  [self.player play];
}

- (void)startDecoder {
  self.localUrl = nil;
  self.canPrepare = NO;
  int ret = [JDMediaDecoder create_decoder:@"class1student1" andSid:@"aaaaa"];
  ret = [JDMediaDecoder start_decoder];
  ret = [self addItems];
}

- (int)addItems {
  int ret = 0;
  
  NSString *courseId = @"406877";
  self.lessonId = @"439793";
  self.sectionId = @"453403";
  NSString *key = @"fiR7ZgE056S7v1XiMsqguoCQ3mdGGjRRVThnQnVFNeo=";
  NSArray *baseUrls = @[@"http://txhttp.jiandan100.cn/ftp/f01/406877/439793",
                        @"http://ftp.jiandan100.cn/ftp/f01/406877/439793"];
  NSString *sectionInfo = [NSString stringWithFormat:@"%@#%@", self.sectionId, key];
  NSArray *sectionInfos = @[sectionInfo];
  ret = [JDMediaDecoder add_decode_itemsEx:baseUrls
                                   bufLoan:[self getVideoCachePath]
                                existLocal:[self getVideoLocalPath]
                                       lid:self.lessonId
                                      rlid:courseId
                                       cid:courseId
                                     ctype:1
                                      sids:sectionInfos];
  
  return ret;
}

- (NSString *)getVideoCachePath {
  NSString *docPath = [self getDocumentsPath];
  return [NSString stringWithFormat:@"%@/videoCache", docPath];
}

- (NSString *)getVideoLocalPath {
  NSString *docPath = [self getDocumentsPath];
  return [NSString stringWithFormat:@"%@/videoLocal", docPath];
}

- (NSString *)getDocumentsPath {
  NSArray<NSURL *> *urls =
  [[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory
                                         inDomains:NSUserDomainMask];
  NSURL *url = [urls objectAtIndex:0];
  return [url path];
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

@end
