//
//  JDMediaDecoder.m
//  post.c&cpp&oc
//
//  Created by juanq on 15/8/21.
//  Copyright (c) 2015年 Ulix. All rights reserved.
//

#import <sys/types.h>
#import <sys/stat.h>
#import <sys/fcntl.h>
#import "JDMediaDecoder.h"
#import "native2.h"
#import "UxConfig.h"
#import "util.h"
#import "UxBlockrw.h"

@implementation JDMediaDecoder

#pragma mark ---c底层回调oc部分

// 底层出错回调函数
int wpErrorMessageComesFun(int nErrType, const char *errMsg, int noUse) {
    NSString *msg= [NSString stringWithCString:errMsg encoding:NSUTF8StringEncoding];
    /*PlayError* error=[[PlayError alloc] init];
    error.errMsg=msg;
    error.errType=nErrType;
    [[NSNotificationCenter defaultCenter]
     postNotificationName:N_PLAY_ERROR object:error];*/
    NSLog(@"--error--: %d, %@\n", nErrType, msg);
    return 0;
}

// 底层加载进度反馈回调
int wpProgressAvailable(const char *lid, int index, long total, long avail) {
    /*PlayPregress* progress=[[PlayPregress alloc] init];
    progress.lid=leid;
    progress.index=index;
    progress.total=(int)total;
    progress.available=(int)avail;
    [[NSNotificationCenter defaultCenter]
     postNotificationName:N_PLAY_PROGRESS_AVISIBLE object:progress];*/
    NSLog(@"--- total: %ld, avail: %ld", total, avail);
    return 0;
}

// 底层已经拿到了key，可以开始解密
int wpKeyAvailableFun(const char *lid, int noUse) {
    [[NSNotificationCenter defaultCenter]
     postNotificationName:DECODER_EVENT_KEY_AVAILABLE object:nil];
    return 0;
}

// 底告诉我们某个section数据准备好播放了
int wpCanPrepared(const char *lid, const char *sid) {
    [[NSNotificationCenter defaultCenter]
     postNotificationName:DECODER_EVENT_CAN_PREPARE object:nil];
    return 0;
}

#pragma mark ---OC调用底层实现

// 将唯一标示token传给底层（c层），底层（c）保存起来，用作其他用
+ (int)init_data {
    NSString *tokenStr = [self getDeviceToken];
    char *token = (char *)[self string2Char:tokenStr];
    int ret = 0;
    if (token) {
        ret = SetDeviceDataEX(token, (int)strlen(token));
    } else {
        ret = -1;
    }
    return ret;
}

// 创建localserver
+ (int)create_decoder:(NSString *)uid andSid:(NSString *)sessionId {
    int ret = 0;
    init_all();
    NSString *tokenStr = [self getDeviceToken];
    char *token = (char *)[self string2Char:tokenStr];
    do {
        if (token) {
            ret = SetDeviceDataEX(token, (int)strlen(token));
        } else {
            ret = -1;
        }
        const char *pUserId = [self string2Char:[NSString stringWithFormat:@"%@", uid]];
        const char *pSessionId = [self string2Char:sessionId];
        ret = (int)create_decoder_l();
        if (!ret) {
            NSLog(@"Set SessionID--%s, & UserId--%s\n", pSessionId, pUserId);
            ret = (int)set_sessionid_and_userid(pSessionId, pUserId);
        }
    } while (0);
    UxLog("create_decoder after. ret[%d].\n", ret);
    return ret;
}

// 启动解码
+ (int)start_decoder {
    int ret = 0;
    NSLog(@"start_decoder begin.\n");
    ret =(int)start_decoder_l();
    NSLog(@"start_decoder after.ret[%d]\n", ret);
    return ret;
}

// http请求头信息,重复设置覆盖之前的值
+ (int)set_request_other_info:(NSString *)key value:(NSString *)value {
    int ret = 0;
    const char *pKey = [self string2Char:key];
    const char *pValue = [self string2Char:value];
    ret = (int)add_http_header_l(pKey, pValue);
    return ret;
}

// 暂停解码，暂停server，不暂停对应section的缓冲下载
+ (int)pause_decoder {
    int ret = 0;
    
    NSLog(@"pause_decoder begin.\n");
    ret = (int)pause_decoder_l();
    NSLog(@"pause_decoder after.ret[%d]\n", ret);
    return ret;
}

// 停止解码，全部停止
+ (int)stop_decoder {
    int ret = 0;
    NSLog(@"stop_decoder begin.\n");
    ret = (int)stop_decoder_l();
    NSLog(@"stop_decoder after.[%d]\n", ret);
    return ret;
}

// 销毁解码，完全清理
+ (int)destroy_decoder {
    int ret = 0;
    NSLog(@"destroy_decoder begin.\n");
    ret = (int)destroy_decoder_l();
    NSLog(@"destroy_decoder after.ret[%d]\n",ret);
    return ret;
}

+ (int)processBaseUrls:(char **)baseUrls
                 count:(int)baseUrlsCount
            fromOrigin:(NSArray *)_baseUrls {
    int ret = 0;
    
    for (int i = 0; i < baseUrlsCount; i++) {
        baseUrls[i] = NULL;
        const char *baseUrl = [self string2Char:[_baseUrls objectAtIndex:i]];
        baseUrls[i] = (char *)malloc(sizeof(char *) * (strlen(baseUrl) + 1));
        if (baseUrls[i] == NULL) {
            UxLog("--==--: malloc failed\n");
            ret = -1;
            break;
            //return -1; // 不能在这里直接返回，比如数组前几个分配成功了，还需要释放前几个的。
        }
        strcpy(baseUrls[i], baseUrl);
    }
    if (ret) {
        for (int i = 0; i < baseUrlsCount; i++) {
            if (baseUrls[i] != NULL) {
                free(baseUrls[i]);
            }
        }
        return ret;
    }
    
    return ret;
}

// // 添加需要播放的section，定制名师课模式
+ (int)add_decode_itemsEx:(NSArray *)_baseUrls
                  bufLoan:(NSString *)buffLocal
               existLocal:(NSString *)existLocal
                      lid:(NSString *)lid
                     rlid:(NSString *)rlid
                      cid:(NSString *)cid
                    ctype:(int)ctype
                     sids:(NSArray *)sids {
    int ret = 0;
    
    const int baseUrlsCount = (int)[_baseUrls count];
    char *baseUrls[baseUrlsCount];
    ret = [self processBaseUrls:baseUrls count:baseUrlsCount fromOrigin:_baseUrls];
    if (ret) {
        return ret;
    }
    
    const char *pBuffLocal = [self string2Char:buffLocal];
    const char *pExistLocal = [self string2Char:existLocal];
    const char *pLessonId = [self string2Char:lid];
    const char *pRealLessonId = [self string2Char:rlid];
    //const char *pCid = [self string2Char:cid];
    
    struct stat LocalStat;
    struct stat buffStat;
    
    char szLocal[256] = {0};
    char szLocal2[256] = {0};
    
    const int sectionCount = (int)[sids count];
    char *pSectionInfos[sectionCount];
    for (int i = 0; i < sectionCount; i++) {
        pSectionInfos[i] = NULL;
        const char *pSectionInfo = [self string2Char:[sids objectAtIndex:i]];
        pSectionInfos[i] = (char *)malloc(sizeof(char *) * (strlen(pSectionInfo) + 1));
        if (pSectionInfos[i] == NULL) {
            UxLog("--==--: malloc failed\n");
            ret = -1;
            break;
        }
        strcpy(pSectionInfos[i], pSectionInfo);
        
        char sectionInfo[256] = {0};
        snprintf(sectionInfo, 256, "%s", pSectionInfo);
        const char *pSectionId = strtok(sectionInfo, "#");
        
        snprintf(szLocal, 256, "%s/%s/%s/%s-3.etvx", pExistLocal, pRealLessonId,
                 pLessonId, pSectionId);
        if (stat(szLocal, &LocalStat)) { // 执行失败，文件不存在
            snprintf(szLocal, 256, "%s/%s/%s/%s-3.etvx", pBuffLocal,
                     pRealLessonId, pLessonId, pSectionId);
            snprintf(szLocal2, 256, "%s/%s/%s/%s-3.etvx.lbuf", pBuffLocal,
                     pRealLessonId, pLessonId, pSectionId);
            if (!stat(szLocal2, &buffStat)) { // 执行成功
                UxBlockRw *pRw = uxOpenBlockRw(szLocal, 0);
                if (pRw) {
                    UxBlockBlankItem *pBlankList = NULL;
                    int nAllFinished = 0;
                    if (!uxGetBlankList(pRw, 0, &pBlankList, &nAllFinished)) {
                        long fileSize = (long)buffStat.st_size;
                        long availSize = (long)(nAllFinished ? buffStat.st_size :
                                                pBlankList ? pBlankList->m_nStart : 0);
                        wpProgressAvailable([self string2Char:lid], i, fileSize, availSize);
                        uxFreeBlockBlankList(&pBlankList);
                    }
                    uxCloseBlockRw(&pRw);
                }
            }
        } else {
            long fileSize = (long)LocalStat.st_size;
            wpProgressAvailable([self string2Char:lid], i, fileSize, fileSize);
        }
        
        ret = (int)add_decode_itemEx_l((const char **)baseUrls, baseUrlsCount,
                                       szLocal, pLessonId, pSectionId, i, ctype);
    }
    if (ret) {
        for (int i = 0; i < sectionCount; i++) {
            if (pSectionInfos[i] != NULL) {
                free(pSectionInfos[i]);
            }
        }
        return ret;
    }
    
    ret = (int)prepare_decode_keysEx_l(pLessonId, (const char **)pSectionInfos,
                                       sectionCount);
    // free resources
    for (int i = 0; i < sectionCount; i++) {
        if (pSectionInfos[i] != NULL) {
            free(pSectionInfos[i]);
        }
    }
    for (int i = 0; i < baseUrlsCount; i++) {
        if (baseUrls[i] != NULL) {
            free(baseUrls[i]);
        }
    }
    
    return ret;
}

// 添加需要播放的section
//+ (int)add_decode_items:(NSString*)baseUrl
+ (int)add_decode_items:(NSArray *)baseUrls
                bufLoan:(NSString *)buffLocal
             existLocal:(NSString *)existLocal
                    lid:(NSString *)lid
                   rlid:(NSString *)rlid
                   sids:(NSArray *)sids
                    cid:(NSString *)cid
                  ctype:(int)ctype {
    int ret = 0;
    UxLog("add_decoder_item begin.");
    char szUrl[256] = {0};
    char szLocal[256] = {0};
    char szLocal2[256] = {0};
//    const char *pBaseUrl = [self string2Char:baseUrl];
    const char *pBuffLocal = [self string2Char:buffLocal];
    const char *pExistLocal = [self string2Char:existLocal];
    const char *pLessonId = [self string2Char:lid];
    const char *pCourseId = [self string2Char:cid];
    const char *pRealLessonId = [self string2Char:rlid];
    NSInteger nSids = [sids count];
    struct stat stLocalState;
    struct stat stBufferState;
    for (int i = 0; i < nSids; i++) {
        NSString* jSid = [sids objectAtIndex:i];
        const char *pSectionId = [self string2Char:jSid];
        if(ctype == 11 || ctype == 111) {
            if(strcspn(pSectionId, "/") > 5){
//                snprintf(szUrl, 256, "%sf01/%s-3.etvx", pBaseUrl, pSectionId);
                snprintf(szUrl, 256, "f01/%s-3.etvx", pSectionId);
            } else {
//                snprintf(szUrl, 256, "%s%s-3.etvx", pBaseUrl, pSectionId);
                snprintf(szUrl, 256, "%s-3.etvx", pSectionId);
            }
        } else if (strlen(pRealLessonId) > 5) {
//            snprintf(szUrl, 256, "%sf01/%s/%s/%s-3.etvx", pBaseUrl, pRealLessonId,
//                     pLessonId, pSectionId);
            snprintf(szUrl, 256, "f01/%s/%s/%s-3.etvx", pRealLessonId,
                     pLessonId, pSectionId);
        } else {
//            snprintf(szUrl, 256, "%s%s/%s/%s-3.etvx", pBaseUrl, pRealLessonId,
//                     pLessonId, pSectionId);
            snprintf(szUrl, 256, "%s/%s/%s-3.etvx", pRealLessonId, pLessonId,
                     pSectionId);
        }
        snprintf(szLocal, 256, "%s/%s/%s/%s-3.etvx", pExistLocal, pRealLessonId,
                 pLessonId, pSectionId);
        if (stat(szLocal, &stLocalState)) {
            snprintf(szLocal, 256, "%s/%s/%s/%s-3.etvx", pBuffLocal, pRealLessonId,
                     pLessonId, pSectionId);
            snprintf(szLocal2, 256, "%s/%s/%s/%s-3.etvx.lbuf", pBuffLocal,
                     pRealLessonId, pLessonId, pSectionId);
            if (!stat(szLocal2, &stBufferState)) {
                UxBlockRw *pRw = uxOpenBlockRw(szLocal, 0);
                if (pRw) {
                    UxBlockBlankItem *pBlankList = NULL;
                    int nAllFinished = 0;
                    if (!uxGetBlankList(pRw, 0, &pBlankList, &nAllFinished)) {
                        long fileSize = (long)stBufferState.st_size;
                        long availSize = (long)(nAllFinished ? stBufferState.st_size :
                                               pBlankList->m_nStart);
                        wpProgressAvailable([self string2Char:lid], i, fileSize, availSize);
                        uxFreeBlockBlankList(&pBlankList);
                    }
                    uxCloseBlockRw(&pRw);
                }
            }
        } else {
            long fileSize = (long)stLocalState.st_size;
            wpProgressAvailable([self string2Char:lid], i, fileSize, fileSize);
        }
        // 所有文件都默认为是部分加密文件
        int count = (int)[baseUrls count];
        const char *cBaseUrls[count];
        for (int i = 0; i < count; i++) {
            cBaseUrls[i] = [self string2Char:[baseUrls objectAtIndex:i]];
        }
        ret = (int)add_decode_item_l(cBaseUrls, count, szUrl, szLocal, pLessonId,
                                     pSectionId, i, 1);
        
//        const char *empthStr = "";
//        ret = (int)add_decode_item_l(&empthStr, 1, szUrl, szLocal, pLessonId,
//                                     pSectionId, i, 1);
    }
    ret = (int)prepare_decode_keys_l(pLessonId,pCourseId,ctype);
//    (long)prepare_decode_keys_l(const char *lid, const char *cid, int ctype);
    UxLog("add_decoder_item after.ret[%d]", ret);
    return ret;
}

// 移除解码文件, local必须填写, url选填
+ (int)remove_decode_item:(NSString *)lid {
    int ret = 0;
    const char *pLessonId =[self string2Char:lid];
    ret = (int)remove_decode_item_l(pLessonId);
    return ret;
}

// 准备key，完成后启动线程开始下载文件到本地，同时生成本地server的url
+ (int)prepare_to_decode:(AVPlayer *)player
                     lid:(NSString *)lid
                     sid:(NSString *)sid {
    int ret = 0;
    const char *pLid = NULL;
    const char *pSid = NULL;
    
    do {
        pLid = [self string2Char:lid];
        if (!pLid) {
            ret = -1;
            break;
        }
        pSid = [self string2Char:sid];
        if (!pSid) {
            ret = -1;
            break;
        }
        char *pRequireUrl = NULL;
        if (prepare_to_decode_l(pLid, pSid, &pRequireUrl)) {
            NSLog(@"prepare_to_decode error.\n");
            ret = -1;
            break;
        }
        NSString *requireUrl =[self char2String:pRequireUrl];
//        [player setContentURL:[NSURL URLWithString:requireUrl]];
        [[NSNotificationCenter defaultCenter]
         postNotificationName:DECODER_EVENT_GOT_LOCAL_URL object:requireUrl];
    } while (0);
    
    return ret;
}

+ (int)wantToseek {
    return (int)want_to_seek();
}

#pragma mark ---功能区域转换

+ (const char *)string2Char:(NSString *)str {
    const char *char_content = [str cStringUsingEncoding:NSASCIIStringEncoding];
    return char_content;
}

+ (NSString *)char2String:(char *)tempChar {
    return [NSString stringWithCString:tempChar encoding:NSUTF8StringEncoding];
}

+ (NSString *)getDeviceToken {
    return @"no need";
}

@end
