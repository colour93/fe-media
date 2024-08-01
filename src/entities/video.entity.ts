import { nanoid } from "nanoid";
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, ManyToMany } from "typeorm"
import { Tag } from "./tag.entity";

@Entity()
export class Video {
    @PrimaryGeneratedColumn()
    cid: number;

    @Column()
    nid: string;

    @Column()
    basePath: string;

    @Column()
    relativePath: string;

    @Column()
    filename: string;

    @Column({
        nullable: true
    })
    title?: string;

    @Column({
        nullable: true
    })
    description?: string;

    @Column()
    size: number;

    @Column({ type: "float" })
    duration: number;

    @Column()
    hash: string;

    @Column()
    createdAt: Date;

    @Column()
    modifiedAt: Date;

    @Column()
    importedAt: Date;

    @Column({
        nullable: true
    })
    updatedAt: Date;

    @Column({
        nullable: true,
        default: false
    })
    invalid: boolean;

    @ManyToMany(() => Tag, tag => tag.videos)
    tags: Tag[];

    @BeforeInsert()
    beforeInsert() {
        const ts = new Date();
        this.importedAt = ts;
        this.updatedAt = ts;
        this.nid = nanoid();
    }

    @BeforeUpdate()
    beforeUpdate() {
        this.updatedAt = new Date();
    }
}