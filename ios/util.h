#ifndef __H_UTIL_H__
#define __H_UTIL_H__

#include "typedef.h"
#include "UxConfig.h"
#include <sys/types.h>

#define HARDDATALENGTH		64
#define DEVICEDATALENGTH	64
#define USERKEYLENGTH	    64
#define FILEKEYLENGTH	    64
#define IVLEN               8
#define KEYLEN              24
#define MAXURLLEN			256

#define ENC_TYPE_NONE 0
#define ENC_TYPE_PARTIAL 1
#define ENC_TYPE_ALL 2

int GetCPUSerialNumber(char *buffer, const int buf_len);

int SetDeviceDataEX(char *setData, int dataLen);

int uxGetUserKey(char *pUID, unsigned char *pUserKey, int *pUserKeyLen, BOOL bRawData/* = true*/);

BOOL GetFileKey(char *pRawKey, char *pLID, char *pUID, unsigned char *pFileKey, int *pFileKeyLen);

BOOL GetFileKey2(char *pRawKey, char *pLID, char *pUID, char *pSessonId, unsigned char *pFileKey,
                 int *pFileKeyLen);

BOOL GetFileKeyEx(char *pRawKey, char *pUserName, char *pSectionId, unsigned char *pFileKey,
                  int *pFileKeyLen);

int uxEncryptString(const char *pRaw, const size_t nRaw, char **pEncrypt, size_t *nEncrypt, int nLogin);

int GetEncryptString(int bEncrypt, unsigned char *pRawData, int nRawDataLen, unsigned char **ppRetData,
                     int *nRetDataLen);

int uxGetEncryptionString(const char *pRawData, const size_t rawLen, const char *keyItems,
                          char **pEncrypted, int *encryptedLen);

#endif
