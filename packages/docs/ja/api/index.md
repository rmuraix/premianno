# APIリファレンス

このページでは、PremiAnnoの現行データ形式を説明します。

## 対象範囲

PremiAnnoが現在扱うデータ出力は以下です。

- 内部保存: JSON（`AnnotationSet`）
- エクスポート: TOML（`ExportFile` のシリアライズ）
- クラス一覧: JSON配列（CSVから読み込み）

## 型定義

コードベースの共有型:

```ts
export type Sequence = {
  id: string;
  name: string;
  timebase: string;
  frameRate?: number;
  projectPath?: string;
};

export type Interval = {
  id: string;
  startSeconds: number;
  endSeconds: number;
  durationFrames: number;
  orderIndex: number;
  label?: string | null;
};

export type AnnotationSet = {
  sequence: Sequence;
  intervals: Interval[];
  lastUpdatedAt: string;
  sourceVersion: string;
};

export type ExportFile = {
  sequence: Sequence;
  exportedAt: string;
  intervals: Interval[];
};
```

## 内部JSON（AnnotationSet）

シーケンス単位のアノテーションは、UXPのプラグインデータフォルダー（`uxp.storage.localFileSystem.getDataFolder()`）にJSON保存されます。

```json
{
  "sequence": {
    "id": "4f2e8...",
    "name": "Main Sequence",
    "timebase": "254016000000",
    "frameRate": 29.97,
    "projectPath": "/path/to/project.prproj"
  },
  "intervals": [
    {
      "id": "0.000000-3.336667",
      "startSeconds": 0,
      "endSeconds": 3.336667,
      "durationFrames": 100,
      "orderIndex": 0,
      "label": "Intro"
    }
  ],
  "lastUpdatedAt": "2026-02-19T00:00:00.000Z",
  "sourceVersion": "1"
}
```

## TOMLエクスポート形式

`Export TOML` で出力される形式:

```toml
[sequence]
id = "4f2e8..."
name = "Main Sequence"
timebase_ticks = "254016000000"
frame_rate = 29.97
project_path = "/path/to/project.prproj"
exported_at = "2026-02-19T00:00:00.000Z"

[[intervals]]
start_seconds = 0
end_seconds = 3.336667
duration_frames = 100
order_index = 0
label = "Intro"
```

## クラスCSV読み込み形式

推奨CSV:

```csv
index,class
0,Intro
1,Dialogue
2,B-roll
```

動作:
- `index,class` ヘッダーがあればその列を使用
- ヘッダー無しの場合は1列目=index、2列目=classとして処理
- `index` でソート
- 生成されたクラス配列がUIドロップダウン候補になる

## 連携例

Python（3.11+ の `tomllib`）:

```python
import tomllib

with open("annotations.toml", "rb") as f:
    data = tomllib.load(f)

for interval in data["intervals"]:
    label = interval.get("label")
    print(interval["start_seconds"], interval["end_seconds"], label)
```
