//
//  JDMediaDecoder.h
//  post.c&cpp&oc
//
//  Created by juanq on 15/8/21.
//  Copyright (c) 2015年 Ulix. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>

#define DECODER_EVENT_KEY_AVAILABLE @"decoderKeyAvailable"
#define DECODER_EVENT_CAN_PREPARE   @"decoderCanPrepare"
#define DECODER_EVENT_GOT_LOCAL_URL @"decoderGotLocalUrl"
#define DECODER_EVENT_PROGRESS      @"decoderProgress"
#define DECODER_EVENT_ERROR         @"decoderError"

@interface JDMediaDecoder : NSObject
// 将唯一标示devicetoken传给底层（c层），底层（c）保存起来，用作其他用s
+ (int)init_data;

// 创建server
+ (int)create_decoder:(NSString*) uid andSid: (NSString*)sessionId;

// 启动解码
+ (int)start_decoder;

// http请求头信息,重复设置覆盖之前的值
+ (int)set_request_other_info:(NSString*)key value:(NSString*)value;

// 暂停解码，暂停server，不暂停对应section的缓冲下载
+ (int)pause_decoder;

// 停止解码，全部停止
+ (int)stop_decoder;

// 销毁解码，完全清理
+ (int)destroy_decoder;

/*
 * 添加解码文件, 本地存在文件 url传递NULL
 *   url - 服务器上section文件下载url
 *   buffLocal - 混存路径
 *   existLocal - 下载路径
 *   lid - lesson id
 *   sid - section id
 *   cid --course Id
 *   fileSize - 对于服务器端文件,section文件的大小
 */
//+ (int)add_decode_items:(NSString*)baseUrl
+ (int)add_decode_items:(NSArray *)baseUrls
                bufLoan:(NSString *)buffLocal
             existLocal:(NSString *)existLocal
                    lid:(NSString *)lid
                   rlid:(NSString *)rlid
                   sids:(NSArray *)sids
                    cid:(NSString *)cid
                  ctype:(int)ctype;

+ (int)add_decode_itemsEx:(NSArray *)_baseUrls
                  bufLoan:(NSString *)buffLocal
               existLocal:(NSString *)existLocal
                      lid:(NSString *)lid
                     rlid:(NSString *)rlid
                      cid:(NSString *)cid
                    ctype:(int)ctype
                     sids:(NSArray *)sids;

// 移除解码文件, local必须填写, url选填
+ (int)remove_decode_item:(NSString*) lid;

/*
 * 开始准备解码,服务器上的文件,执行此操作成功后,开始下载缓存,
 * 返回0后, 建议执行prepareAsync,等待Async成功可以开始播放
 *   player - 播放器实例
 *   uri - 本地文件传递文件路径, 远程文件传递url, 上面添加的都可以传递,
 *   远程文件请注意,要以http开头的全路径,本地文件要绝对路径
 */
+ (int)prepare_to_decode:(AVPlayer *)player
                     lid:(NSString *)lid
                     sid:(NSString *)sid;

+ (int)wantToseek;

@end
