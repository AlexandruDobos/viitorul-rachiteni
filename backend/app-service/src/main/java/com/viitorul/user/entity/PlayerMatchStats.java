package com.viitorul.user.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class PlayerMatchStats {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    private Player player;

    @ManyToOne
    private Match match;

    private int minutesPlayed;
    private int goals;
    private int assists;
    private int yellowCards;
    private int redCards;

    private boolean startingPlayer;     // dacă a fost titular
    private boolean substitutedIn;      // dacă a intrat pe parcurs
    private boolean substitutedOut;     // dacă a fost schimbat

    private int shirtNumber;            // opțional - în caz că diferă per meci
    private double rating;              // notă acordată jucătorului
    private String positionPlayed;      // dacă a jucat pe alt post decât cel principal
    private String notes;               // comentarii libere: "accidentat în minutul 32", "execuție din voleu"

    private boolean manOfTheMatch;      // dacă a fost omul meciului
}
