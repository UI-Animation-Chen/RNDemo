#ifndef __H_UX_CONFIG_H__
#define __H_UX_CONFIG_H__

//#define UxDebug
//#define UxMakeForTest

#ifdef UxDebug
    #ifdef UxMakeForTest
        #define UxLog printf
        #define UxLogI printf
        #define UxLogW printf
        #define UxLogE printf
        #include <stdlib.h>
        #define UxAssert(x) \
            do{if(!(x)){UxLogE("*******abort():[%s:%d]\n", __FILE__, __LINE__); abort();}} while(0)
    #else
        #include <android/log.h>
        #define UxLogV(...) __android_log_print(ANDROID_LOG_VERBOSE, "uxDbg", __VA_ARGS__)
        #define UxLogI(...)	__android_log_print(ANDROID_LOG_INFO, "uxDbgI", __VA_ARGS__)
        #define UxLogW(...)	__android_log_print(ANDROID_LOG_WARN, "uxDbgW", __VA_ARGS__)
        #define UxLogE(...) __android_log_print(ANDROID_LOG_ERROR, "uxDbgE", __VA_ARGS__)
        #define UxLog(...) \
            do{/*UxLogV("[%s:%d]\n", __FILE__, __LINE__);*/UxLogV(__VA_ARGS__);} while (0)
        #include <stdlib.h>
        #define UxAssert(x) \
            do{if(!(x)){UxLogE("*******abort():[%s:%d]\n", __FILE__, __LINE__); abort();}} while(0)
    #endif
#else
    #define UxLog(...)
    #define UxLogI(...)
    #define UxLogW(...)
    #define UxLogE(...)
    #define UxAssert(x)
#endif

#define __UNUSED(x) (void)(x)

int wpErrorMessageComesFun(int nErrType, const char *errMsg, int notFromThread);
int wpProgressAvailable(const char *lid, int index, long total, long avail);
int wpKeyAvailableFun(const char *lid, int notFromThread);
int wpCanPrepared(const char *lid, const char *sid);

void uxCBFinishedDownload(long inst, long addon);
void uxCBErrorDownload(long inst, long addon);
void uxCBProgressNotify(long inst, long addon, long total, long downloaded);

#define wpKeyAvailable(lid) wpKeyAvailableFun(lid, 0)
#define wpErrorMessageComes(nErrType, errMsg) wpErrorMessageComesFun(nErrType, errMsg, 0)

#define UXERR_UNKNOWN_ERROR 1000
#define UXERR_SESSION_TIMEOUT 1001
#define UXERR_HTTP_OPERATION 1002
#define UXERR_NOMORE_SPACE 1003
#define UXERR_FAILED_GETKEY 1004

#define MAX_APPEND_HTTP_HEADERS_COUNT 30
#define MAX_DOWNLOADING_COUNT 30
#define BASE_HTTP_URL "http://service.jd100.com/cgi-bin/phone/"

//#define BUILD_MOBILE_LESSON
#define BUILD_GUIDE_CLASS
//#define BUILD_ET_PLAYER
//#define BUILD_ESTUDENT_PAD

#endif
