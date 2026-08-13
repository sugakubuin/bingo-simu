import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function RulesModal({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="rules-dialog"
      aria-labelledby="rules-title"
      onClose={onClose}
      onClick={onClose}
    >
      <div
        className="rules-dialog-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rules-dialog-head">
          <h2 id="rules-title">ゲームのルール</h2>
          <button
            type="button"
            className="help-q"
            aria-label="閉じる"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="rules-dialog-body">
          <section>
            <h3>チューリップ</h3>
            <p>
              和了時にツモ山の上段を、ドラ表示牌側から 1 トンずつめくる。めくった牌とその前後の牌が手牌（＋抜き牌）に含まれていれば、その枚数だけ祝儀がのる。1 枚ものらなかった時点で終了。のる限り山の端まで続ける。
            </p>
          </section>

          <section>
            <h3>確変・突確・16R</h3>
            <ul>
              <li>確変中は上段に加え下段もめくれる。上下どちらものらなければ終了。</li>
              <li>
                突確は<strong>1 枚のめくり</strong>で 6 枚以上のったとき。上下合計 6 枚では入らない。入ると次のトンから確変。
              </li>
              <li>
                16R は「777 の 777」（7p と 7s がともに 3 枚以上）か、確変中の突確で入る。終了時の合計が 2 倍。重複しても 2 倍のまま。
              </li>
              <li>
                転落保証は、0 枚のトンで 1 個消費して終了をスキップできる。複数あれば連続消費できる。
              </li>
            </ul>
          </section>

          <section>
            <h3>のり判定</h3>
            <p>牌は循環する。めくり牌 X に対し、前後と自身の手牌枚数がのる。</p>
            <ul>
              <li>筒子・索子: 1→…→9→1</li>
              <li>風牌: 東→南→西→北→東</li>
              <li>三元牌: 白→發→中→白（3 枚循環のため、白がめくれると白發中すべて）</li>
            </ul>
            <p>
              花牌がめくれたときののりは抜き枚数 × 3（0 / 3 / 6 / 9 / 12）。花牌は数牌・字牌のめくりではのらない。手牌は毎回再利用される。槓子は 4 枚として数える。
            </p>
          </section>

          <section>
            <h3>スーパービンゴ（112 枚）</h3>
            <ul>
              <li>萬子は入らない。7p・7s のみ 8 枚ずつ。他の筒索は各 4、字牌各 4、花牌 4。</li>
              <li>
                <strong>花牌では突確しない。</strong>9 枚・12 枚のっても状態は変わらない。
              </li>
            </ul>
          </section>

          <section>
            <h3>ウルトラビンゴ（108 枚）</h3>
            <ul>
              <li>1m・9m の代わりに 7m を 4 枚入れる。筒索字は各 4、花牌 4。</li>
              <li>
                山の 7m は 7p / 7s ののりが大きい方として扱う（nori(7m) = max(nori(7p), nori(7s))）。
              </li>
              <li>
                <strong>花牌で 6 枚以上のれば突確する</strong>（抜き 2 枚以上）。
              </li>
            </ul>
          </section>

          <section>
            <h3>和了種別と初期状態</h3>
            <p>手牌の 7 で初期状態が決まる。リーチ役満・天地人和は、777 がなくても確変から始まる。</p>
            <table>
              <thead>
                <tr>
                  <th>種別</th>
                  <th>777 の 777</th>
                  <th>777 のみ</th>
                  <th>なし</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>通常手 / リーチなし役満</td>
                  <td>16R</td>
                  <td>確変</td>
                  <td>通常</td>
                </tr>
                <tr>
                  <td>リーチ役満・天地人和</td>
                  <td>16R</td>
                  <td>確変</td>
                  <td>確変</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </dialog>
  );
}
