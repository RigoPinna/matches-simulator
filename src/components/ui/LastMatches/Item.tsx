import { DrawIcon, LostIcon, WinIcon } from "../../icons";
import styles from "./styles.module.css";
type TItemProps = {
    type: "WIN" | "DRAW" | "LOST" | "WITHOUT";
}
export const Item = ({ type }: TItemProps) => {

    switch (type) {
        case "WIN":

            return (
                <li id="win" className={`${styles.item} ${styles.item_win}`}>
                    <WinIcon className={styles.icon} />
                </li>
            )
        case "DRAW":
            return (
                <li id="draw" className={`${styles.item} ${styles.item_draw}`}>
                    <DrawIcon className={styles.icon} />
                </li>
            )
        case "LOST":
            return (
                <li id="lost" className={`${styles.item} ${styles.item_lost}`}>
                    <LostIcon className={styles.icon} />
                </li>
            )
        default:
            return <li id="without" className={`${`${styles.item} ${styles.item_witout}`}`} />
    }

}
