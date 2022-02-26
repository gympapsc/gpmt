import {Entity, PrimaryGeneratedColumn, Repository, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, EntityRepository, Index} from "typeorm";

export class TimedEntity {
    @CreateDateColumn({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)"})
    updatedAt: Date;
}

@Entity()
export class Message extends TimedEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column()
    issuer: string;

    @ManyToOne(() => User, user => user.messages)
    user: User;

}


@Entity()
export class User extends TimedEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column()
    email: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    sex: string;

    @Column()
    birthDate: Date;

    @Column()
    passwordHash: string;

    @OneToMany(() => Message, message => message.user)
    messages: Message[];
}


@EntityRepository(User)
export class UserRepository extends Repository<User> {

    findByEmail(email: string) {
        return this.findOne({ email })
    }
}