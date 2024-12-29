import { type Config } from 'tailwindcss'

export const extendedTheme = {
  transitionTimingFunction: {
    /**
     * quad（二次曲線）
     * 二次方程式に基づくイージング。
     * 速度の変化が緩やかに始まり、途中で加速または減速します。
     *
     * cubic（三次曲線）
     * 三次方程式に基づくイージング。動きがさらに滑らかになり、より自然な加速と減速の感じがします。
     * 標準的なeaseやease-in、ease-outなどがこのパターンに近い動作です。
     *
     * quart（四次曲線）
     * 四次方程式に基づくイージング。加速・減速がより強調されます。
     * 動きが速くなるまで少し時間がかかり、最終的に急速に進行します。
     *
     * quint（五次曲線）
     * 五次方程式に基づくイージング。非常に急な加速・減速の動きを表現します。
     * 動きが最初は非常に緩やかで、最終的には一気に速度が上がります。
     *
     * expo（指数曲線）
     * 指数関数的なイージング。最初は非常に遅く始まりますが、すぐに急激に加速します。
     *
     * circ（円弧）
     * 円に基づいたイージング。アニメーションの動きが、円の一部をなぞるような滑らかで自然な加速・減速になります。
     * */
    // ease-in
    'ease-in-quad': 'cubic-bezier(.55, .085, .68, .53)',
    'ease-in-cubic': 'cubic-bezier(.550, .055, .675, .19)',
    'ease-in-quart': 'cubic-bezier(.895, .03, .685, .22)',
    'ease-in-quint': 'cubic-bezier(.755, .05, .855, .06)',
    'ease-in-expo': 'cubic-bezier(.95, .05, .795, .035)',
    'ease-in-circ': 'cubic-bezier(.6, .04, .98, .335)',
    // ease-out
    'ease-out-quad': 'cubic-bezier(.25, .46, .45, .94)',
    'ease-out-cubic': 'cubic-bezier(.215, .61, .355, 1)',
    'ease-out-quart': 'cubic-bezier(.165, .84, .44, 1)',
    'ease-out-quint': 'cubic-bezier(.23, 1, .32, 1)',
    'ease-out-expo': 'cubic-bezier(.19, 1, .22, 1)',
    'ease-out-circ': 'cubic-bezier(.075, .82, .165, 1)',
    // ease-in-out
    'ease-in-out-quad': 'cubic-bezier(.455, .03, .515, .955)',
    'ease-in-out-cubic': 'cubic-bezier(.645, .045, .355, 1)',
    'ease-in-out-quart': 'cubic-bezier(.77, 0, .175, 1)',
    'ease-in-out-quint': 'cubic-bezier(.86, 0, .07, 1)',
    'ease-in-out-expo': 'cubic-bezier(1, 0, 0, 1)',
    'ease-in-out-circ': 'cubic-bezier(.785, .135, .15, .86)',
    // ease
    ease: 'ease',
  },
} satisfies Config['theme']
