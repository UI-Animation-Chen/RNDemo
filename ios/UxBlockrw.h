#ifndef __H_UX_BLOCKRW_H__
#define __H_UX_BLOCKRW_H__

#include "UxConfig.h"
#include <sys/types.h>
#include <pthread.h>

extern char ios_path[];

// 块大小默认16k
#define UXDEFAULT_BLOCK_SIZE (16 * 1024)
// 8个bit位，每个bit位对应一个16k的块
#define UXCHUNK_SIZE 8
#define TMPFILE_SUFFIX ".lbuf"
#define CFGFILE_SUFFIX ".lcfg"

// 包含一个或多个连续的blocks。
typedef struct _UxBlockBlankItem {
	size_t m_nStart;
	size_t m_nEnd;
	struct _UxBlockBlankItem *m_pNext;
} UxBlockBlankItem;

typedef enum _UxBlockRwFlag {
	UxRwRead = 1 << 1,
	UxRwWrite = 1 << 2,
} UxBlockRwFlag;

typedef enum _UxEof {
	UxeEOF = 1,
	UxeNotEnd = 0
} UxEOF;

/*
    file是目标文件,在完成写入之前，为buffile, 即file.TMPFILE_SUFFIX

    bufFile 是临时文件,在未写入完成之前,file以bufFile存在，当完成写入后, 更名回file

    cfgFile 是配置文件,bufFile在建立空文件时,直接占位固定大小空间, cfgFile为对bufFile逻辑
    上分块的配置表示,cfgFile中存放的是bufFile按照指定大小分块之后,对应分块位置是否已经使用
    实际数据填充

	cfgFile中的数据,读出到unsigned char中,每一个unsigned char, 8个bit位,每个bit位代表一个
    逻辑块,当对应逻辑块完成写入,则对应位置bit位置1,否则为0.

	一个unsigned char 为一个chunk,为8个逻辑块的大小表示,每一个逻辑块为一个block.

	默认块大小为16k, 一个unsigned char可以表示16 * 8 = 128k空间,
    1M空间需要8个chunk来表示,即8byte, 1024M需要 1024 * 8 = 8k
  
    写入的时候,以block为缓冲单元,当block满了时,向磁盘写入
*/

typedef struct _UxBlockrw {
	UxBlockRwFlag m_nOpenMode;

	char 	*m_pPath;       // 目标文件路径
	size_t	m_nFileSize;    // 目标文件大小
	size_t	m_nBlockSize;	// 目标文件分块的块大小

	char 	*m_pBuffPath;	// 缓存文件路径
	int 	m_buffd;        // 缓存文件的文件描述符
	UxEOF  	m_nEof;		    // 是否已经写到/读到文件末尾 否-0， 是-非零

	char	*m_pCfgPath;    // 配置文件路径
	int     m_cfgfd;        // bitmap文件的文件描述符
	size_t	m_nCfgSize;		// 配置文件的大小, 实际使用大小为其长度-1, 最后一个字节为0

	unsigned char *m_pBitmap;// 文件块bitmap
	size_t 	m_nChunkIndex;  // 当前chunk数据索引
	size_t	m_nBlockIndex;	// 当前chunk中的块索引

	char	*m_pBlockBuff;  // 当前block的数据buffer
	size_t	m_lBuffFilled;  // 当前buffer中有多少数据
	size_t  m_lBuffUsed;    // 读取的时候，已经读取了buffer中多少数据

	pthread_mutex_t m_mutex;
	int     m_nRefCount;
} UxBlockRw;

typedef enum _UxBlockSeekFlag {
	UxSeekBeg = 1,
	UxSeekCur,
	UxSeekEnd
} UxBlockSeekFlag;

/**
* @f: 初始化blockrw信息
* @i: 
* @r: 已经初始化的UxBlockRw 变量
**/
UxBlockRw * uxOpenBlockRw(const char *file, UxBlockRwFlag flag);

UxBlockRw * uxOpenBlockRwWithSize(const char *file, UxBlockRwFlag flag, size_t size);

void uxCloseBlockRw(UxBlockRw **rw);

// 从指定位置开始获取非占位文件数据大小
size_t uxGetValidFileSizeFromPos(UxBlockRw *rw, size_t pos);

// 获取当前文件的块数量
size_t uxGetBlockCount(const UxBlockRw *rw);

// 获取当前文件的块大小
size_t uxGetBlockSize(const UxBlockRw *rw);

// 获取当前文件的大小
size_t uxGetFileSize(const UxBlockRw *rw);

// 将buffer数据，写入到文件中
size_t uxSaveDataToFile(const char *buffer, size_t bufferSize, UxBlockRw *rw);

// 从文件中读出数据到buffer中
size_t uxGetDataToBuffer(char *buffer, size_t bufferSize, UxBlockRw *rw);

// seek操作,根据数据大小seek
size_t uxSeekWithLen(UxBlockRw *rw, size_t seekLen, UxBlockSeekFlag flag);

// seek操作,根据block块seek
size_t uxSeekWithBlock(UxBlockRw *rw, size_t blockCount, UxBlockSeekFlag flag);

int uxGetBlankList(UxBlockRw *rw, size_t wantedStart, UxBlockBlankItem **blankList,
                   int *pAllFinished);

void uxFreeBlockBlankList(UxBlockBlankItem **blankList);

// 是否到了文件结尾
UxEOF uxEOF(UxBlockRw *rw);

// 重新载入配置文件的数据
void uxReloadCfgFile(UxBlockRw *rw);

void uxIncreaseBlockRwRef(UxBlockRw *rw);

#endif
